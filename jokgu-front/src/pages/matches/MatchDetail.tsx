import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';
import type { Match } from '../../types';
import Loading from '../Loading';

export default function MatchDetail() {
    const { mid } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['matchDetail', mid],
        queryFn: async () => {
            const response = await api.get<Match>(`/matches/${mid}`);
            console.log(response.data);
            
            return response.data;
        }
    })

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}시 ${minutes}분`;
    }

    if (isLoading) return <Loading />
    if (!data) return <div>데이터 없음</div>
    return (
        <div className="p-4 flex flex-col justify-center items-center md:py-20">
            <div className="flex flex-col items-center gap-2 py-6">
                <h1 className={`text-3xl font-medium ${data.winner === "A" ? "text-red-500" : "text-blue-500"}`}>
                    {data.winner}팀 승리
                </h1>
                <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                    <span>{data.game === "single" ? "단판" : "3판 2선"}</span>
                    <span>{formatTime(data.created_at)}</span>
                    {data.referee && (<span>심판 {data.referee}</span>)}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 max-w-[720px] w-full">
                <div className="flex-1 border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                    <p className="text-xl font-medium text-green-600">승리</p>
                    {data.teams.filter(user => user.victory === 1).map(user => (
                        <div key={user.uid} className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-xs font-medium text-green-600">
                                {user.name[0]}
                            </div>
                            <span className="text-sm text-gray-900">{user.name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex-1 border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                    <p className="text-xl font-medium text-gray-500">패배</p>
                    {data.teams.filter(user => user.victory === 0).map(user => (
                        <div key={user.uid} className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                {user.name[0]}
                            </div>
                            <span className="text-sm text-gray-900">{user.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}