import { FC, useEffect, useState } from 'react';
import { districtObj } from './districts';
import './index.css';
import './fonts/runescape.ttf'
import useInterval from './hooks/useInterval';

interface District {
    name: string;
    level: number;
    CTS?: number;
    disabled?: boolean;
    timeLeft?: number;
}

const App: FC = () => {

    const [districts, setDistricts] = useState<District[]>(districtObj);
    const [fetching, setFetching]   = useState<boolean>(false);

    const fetchDistricts = async () => {
        setFetching(true);
        const response = await fetch('https://api.weirdgloop.org/runescape/vos');
        const data: any = await response.json();

        let activeDistrict1: any = districts.find(district => district.name === data.district1);
        let activeDistrict2: any = districts.find(district => district.name === data.district2);
        let activeDistricts = activeDistrict1.level < activeDistrict2.level ? [activeDistrict2, activeDistrict1] : [activeDistrict1, activeDistrict2];

        const tempDistricts: District[] = [...districts];

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
        const dave = districtsClone.map(districtItem => (districtItem.name === district.name) ? ({...districtItem, disabled: true, timeLeft: 1200 }) : districtItem)
        setDistricts(dave);

    }

    useInterval(() => {
        const tempDistricts: District[] = [ ...districts ];
        tempDistricts.map((district: District) => {
            if (district?.timeLeft) {
                district.timeLeft--;
            }
            if (district?.timeLeft === 0) {
                district.disabled = false;
                district.timeLeft = undefined;
            }
        });
        setDistricts(tempDistricts);

        const minutes: number = new Date().getMinutes();
        const seconds: number = new Date().getSeconds();
        if ((minutes === 1 || minutes === 2) && seconds === 0) fetchDistricts();

    }, 1000);

    useEffect(() => {
        fetchDistricts();
    }, []);

    return (
        <>
            <div id='districts'>
                {districts.map((district: District, idx: number) => (
                    <div
                        key={idx}
                        className={`district-button ${district.disabled ? 'disabled' : ''}`}
                        onClick={() => startDistrictTimer(district)}
                    >
                        <img src={`https://runescape.wiki/images/${district.name}_Clan.png`} alt={`${district.name} District`} />
                        <span>{district.name}</span>
                        <span>{district.CTS}</span>
                        <span>{district.timeLeft}</span>

                    </div>
                ))}
            </div>
            {fetching && <div className="status"> Updating With New Districts </div>}
        </>
    );

}


export default App;
