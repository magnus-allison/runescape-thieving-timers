import { FC, useEffect, useState } from 'react';
import { districtObj } from './districts';
import './index.css';
import './fonts/runescape.ttf'
import useInterval from './hooks/useInterval';
import useLocalStorage from './hooks/useLocalStorage';
import Color from 'color-thief-react';

interface District {
    name: string;
    level: number;
    CTS?: number;
    disabled?: boolean;
    timeLeft?: number;
    timestamp?: Date;
}

const App: FC = () => {

    const [districts, setDistricts] = useLocalStorage("districts", districtObj);

    const [fetching, setFetching]   = useState<boolean>(false);
    const [hover, setHover] = useState<number | null>(null);

    const fetchDistricts = async () => {
        setFetching(true);
        const response = await fetch('https://api.weirdgloop.org/runescape/vos');
        const data: any = await response.json();

        let activeDistrict1: any = districts.find((district: District) => district.name === data.district1);
        let activeDistrict2: any = districts.find((district: District) => district.name === data.district2);
        let activeDistricts = activeDistrict1.level < activeDistrict2.level ? [activeDistrict2, activeDistrict1] : [activeDistrict1, activeDistrict2];

        const tempDistricts: District[] = [...districts];
        tempDistricts.sort((a, b) => a.level - b.level);
        tempDistricts.reverse();

        let activeDistrictIndex1 = tempDistricts.findIndex(district => district === activeDistrict1);
            tempDistricts.splice(activeDistrictIndex1, 1);
        let activeDistrictIndex2 = tempDistricts.findIndex(district => district === activeDistrict2);
            tempDistricts.splice(activeDistrictIndex2, 1);
        tempDistricts.unshift(...activeDistricts);

        setDistricts(tempDistricts);
        setFetching(false);
    }

    const startDistrictTimer = (district: District) => {
        const districtsClone: District[] = [...districts];
        const tempDistricts = districtsClone.map(districtItem =>
            (districtItem.name === district.name) ? ({...districtItem, disabled: true, timeLeft: 1200, timestamp: new Date()}) : districtItem)
        setDistricts(tempDistricts);

    }

    const clearDistrictTimer = (district: District) => {
        const districtsClone: District[] = [...districts];
        const tempDistricts = districtsClone.map(districtItem =>
            (districtItem.name === district.name) ? ({...districtItem, disabled: false, timeLeft: undefined, timestamp: undefined }) : districtItem)
        setDistricts(tempDistricts);
    }

    useInterval(() => {

        const tempDistricts: District[] = [ ...districts ];

        tempDistricts.map((district: District) => {

            if(district.disabled && district.timestamp) {

                let timestamp: number = new Date(district?.timestamp).getTime();
                let timeDifference: number = Math.abs(timestamp - new Date().getTime()) / 1000;

                district.timeLeft = 1199 - Math.floor(timeDifference);

                if(district.timeLeft <= 0) {
                    district.disabled = false;
                    district.timeLeft = undefined;
                    district.timestamp = undefined;
                }

            }
        });
        setDistricts(tempDistricts);

        const minutes: number = new Date().getMinutes();
        const seconds: number = new Date().getSeconds();
        if ((minutes === 1 || minutes === 2) && seconds === 0) fetchDistricts();

    }, 1000);

    useEffect(() => {
        fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div id='districts'>
                {districts.map((district: District, idx: number) => (
                    <Color src={`https://runescape.wiki/images/${district.name}_Clan.png`} format="hex" crossOrigin='true' key={idx}>
                        {({ data, loading, error }) => (
                            <div
                                className={`
                                    district-button
                                    ${district.disabled ? 'disabled' : ''}
                                    ${idx < 2 ? 'seren-active' : ''}
                                `}
                                style={idx < 2 ? { boxShadow: `0px 0px 3px ${data}` } : {}}
                                onClick={() => !district.disabled && startDistrictTimer(district)}
                                onMouseEnter={() => setHover(idx)}
                                onMouseLeave={() => setHover(null)}
                            >

                                <div
                                    className={`clear-button ${district.disabled && hover === idx ? 'fadeIn' : 'fadeOut'}`}
                                    onClick={() => clearDistrictTimer(district)}
                                >
                                    Clear Timer
                                </div>
                                {/* {(district.disabled && hover === idx) &&
                                } */}
                                <img src={`https://runescape.wiki/images/${district.name}_Clan.png`} alt={`${district.name} District`} />
                                <div className="text">
                                    <span className='name'>{district.name}</span>
                                    <span className='cts'>{district.CTS}</span>
                                    <span>{district.timeLeft}</span>
                                </div>

                            </div>
                        )}
                    </Color>
                ))}
            </div>
            {fetching && <div className="status"> Updating With New Districts </div>}
        </>
    );

}


export default App;
