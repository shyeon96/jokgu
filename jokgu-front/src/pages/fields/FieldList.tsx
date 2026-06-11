import { useQuery } from "@tanstack/react-query"
import api from '../../api/axios'
import type { Fields } from "../../types";
import { Link } from "react-router-dom";
import { Coins, MapPin } from "lucide-react";
import Loading from "../Loading";

export default function FieldList() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['FieldList'],
        queryFn: async () => {
            const response = await api.get<Fields[]>('/fields');
            
            return response.data;
        },
    })

    if (isError) return <div className="p-4 text-sm text-red-400">오류가 발생했습니다.</div>

    return (
        <div className="p-4 md:py-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">경기장 목록</h1>
                <Link to='/fields/create' className="px-4 py-2 text-sm font-medium bg-[#3182F6] hover:bg-[#1a6fe0] text-white rounded-xl transition">
                    추가
                </Link>
            </div>
    
            {isLoading ? (<Loading/>) : data && data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.map((field: Fields) => (
                        <Link key={field.id} to={`/fields/${field.id}`}
                            className="group flex items-center justify-between px-4 py-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center shrink-0">
                                    <MapPin size={17} className="text-[#3182F6]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-slate-800 md:text-base group-hover:text-blue-600 transition-colors">{field.name}</span>
                                    <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <Coins size={12} />
                                        {field.cost && field.cost !== "0" ? <span>{field.cost.toLocaleString()}원 / 시간</span> : <span>무료</span>}
                                    </div>
                                </div>
                            </div>
    
                            <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${field.isIn ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {field.isIn ? '실내' : '실외'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${field.isRes ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {field.isRes ? '예약 필수' : '자유 이용'}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <MapPin size={32} className="mb-3" />
                    <span className="text-sm">등록된 경기장이 없습니다</span>
                </div>
            )}
        </div>
    )
}