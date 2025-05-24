import './index.css';
import './fonts/runescape.ttf';
import { districtObj } from './districts';
import { FC, useEffect, useState } from 'react';
import useInterval from './hooks/useInterval';
import useLocalStorage from './hooks/useLocalStorage';
import Color from 'color-thief-react';
import clsx from 'clsx';
import History from './History';
import { Analytics } from '@vercel/analytics/react';

interface District {
	name: string;
	level: number;
	CTS?: number;
	disabled?: boolean;
	timeLeft?: number;
	timestamp?: Date;
}

export interface APIResponse {
	timestamp: string;
	district1: string;
	district2: string;
	source: string;
}

const App: FC = () => {
	const [districts, setDistricts] = useLocalStorage('districts', districtObj);

	const [fetching, setFetching] = useState<boolean>(false);
	const [hover, setHover] = useState<number | null>(null);

	const fetchDistricts = async () => {
		setFetching(true);
		const response = await fetch('https://api.weirdgloop.org/runescape/vos');
		const data: APIResponse = await response.json();

		let activeDistrict1 = districts.find((district: District) => district.name === data.district1);
		let activeDistrict2 = districts.find((district: District) => district.name === data.district2);
		let activeDistricts =
			activeDistrict1.level < activeDistrict2.level
				? [activeDistrict2, activeDistrict1]
				: [activeDistrict1, activeDistrict2];

		const tempDistricts: District[] = [...districts];
		tempDistricts.sort((a, b) => a.level - b.level);
		tempDistricts.reverse();

		let activeDistrictIndex1 = tempDistricts.findIndex((district) => district === activeDistrict1);
		tempDistricts.splice(activeDistrictIndex1, 1);
		let activeDistrictIndex2 = tempDistricts.findIndex((district) => district === activeDistrict2);
		tempDistricts.splice(activeDistrictIndex2, 1);
		tempDistricts.unshift(...activeDistricts);

		setDistricts(tempDistricts);
		setFetching(false);
	};

	const startDistrictTimer = (district: District) => {
		const districtsClone: District[] = [...districts];
		const tempDistricts = districtsClone.map((districtItem) =>
			districtItem.name === district.name
				? { ...districtItem, disabled: true, timeLeft: 1200, timestamp: new Date() }
				: districtItem
		);
		setDistricts(tempDistricts);
	};

	const clearDistrictTimer = (district: District) => {
		const districtsClone: District[] = [...districts];
		const tempDistricts = districtsClone.map((districtItem) =>
			districtItem.name === district.name
				? { ...districtItem, disabled: false, timeLeft: undefined, timestamp: undefined }
				: districtItem
		);
		setDistricts(tempDistricts);
	};

	useInterval(() => {
		const tempDistricts: District[] = [...districts];

		tempDistricts.map((district: District) => {
			if (district.disabled && district.timestamp) {
				let timestamp: number = new Date(district?.timestamp).getTime();
				let timeDifference: number = Math.abs(timestamp - new Date().getTime()) / 1000;

				district.timeLeft = 1199 - Math.floor(timeDifference);

				if (district.timeLeft <= 0) {
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
	}, []);

	if (fetching && districts.length > 0) {
		return <div className='status'> Updating With New Districts </div>;
	}

	return (
		<>
			<Analytics />
			<div className='districts'>
				{districts.map((district: District, idx: number) => (
					<Color
						src={`https://runescape.wiki/images/${district.name}_Clan.png`}
						format='hex'
						crossOrigin='true'
						key={idx}
					>
						{({ data: color, loading, error }) =>
							!loading && (
								<District
									color={color}
									hover={hover}
									idx={idx}
									district={district}
									onMouseEnter={() => setHover(idx)}
									onMouseLeave={() => setHover(null)}
									style={{
										backgroundColor: color ? color : '#000',
										borderColor: hover === idx ? '#fff' : 'transparent',
										cursor: district.disabled ? 'not-allowed' : 'pointer'
									}}
									onClick={() => {
										if (district.disabled) {
											clearDistrictTimer(district);
										} else {
											startDistrictTimer(district);
										}
									}}
								/>
							)
						}
					</Color>
				))}
			</div>
			<History />
		</>
	);
};

export default App;

interface DistrictProps {
	idx: number;
	district: District;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	style: React.CSSProperties;
	onClick: () => void;
	hover: number | null;
	color: string | undefined;
}

const District: FC<DistrictProps> = ({
	idx,
	district,
	onMouseEnter,
	onMouseLeave,
	style,
	onClick,
	color,
	hover
}) => {
	const toMins = (seconds: number | undefined): string => {
		if (seconds === undefined) return '';
		const mins: number = Math.floor(seconds / 60);
		const secs: number = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div
			className={clsx('district-button', {
				disabled: district.disabled
			})}
			style={idx < 2 ? { borderColor: `${color}` } : {}}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<div className={`clear-button ${district.disabled && hover === idx ? 'fadeIn' : 'fadeOut'}`}>
				Clear Timer
			</div>
			<img
				src={`https://runescape.wiki/images/${district.name}_Clan.png`}
				alt={`${district.name} District`}
			/>
			<div className='text'>
				<span className='name'>{district.name}</span>
				<span className='cts'>{district.CTS}</span>
				<span>{toMins(district.timeLeft)}</span>
			</div>
		</div>
	);
};
