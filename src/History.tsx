import { useEffect, useState, type FC } from 'react';
import { APIResponse } from './App';

interface Props {}

interface HistoryResponse {
	pagination: {
		has_more: boolean;
		total_pages: number;
		total_items: number;
	};
	data: APIResponse[];
}

const History: FC<Props> = () => {
	const [showing, setShowing] = useState<boolean>(false);
	const [history, setHistory] = useState<HistoryResponse | null>(null);
	const [fetching, setFetching] = useState<boolean>(false);

	const fetchDistricts = async () => {
		setFetching(true);
		const response = await fetch('https://api.weirdgloop.org/runescape/vos/history');
		const data: HistoryResponse = await response.json();
		setHistory(data);
		setFetching(false);
	};

	useEffect(() => {
		fetchDistricts();
	}, []);

	if (fetching || !history?.data) return null;

	return (
		<div className='history'>
			<button onClick={() => setShowing(!showing)} className='history-button'>
				{showing ? 'Hide History' : 'Show History'}
			</button>
			{showing && (
				<table style={{ marginTop: '1rem', width: '100%', borderSpacing: '0 0.3rem' }}>
					<thead>
						<tr style={{ textAlign: 'left', fontWeight: 'bold' }}>
							<th>Timestamp</th>
							<th>District 1</th>
							<th>District 2</th>
							<th>Source</th>
						</tr>
					</thead>
					<tbody>
						{history?.data.map((item: APIResponse, index: number) => (
							<tr key={index}>
								<td>{new Date(item.timestamp).toLocaleString()}</td>
								<td>{item.district1}</td>
								<td>{item.district2}</td>
								<td>{item.source}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default History;
