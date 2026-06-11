import { useQuery } from "@tanstack/react-query"
import api from "../../api/axios"
import type { GroupList } from "../../types"
import { Link } from "react-router-dom";
import { useState } from "react";
import JoinGroupModal from "./JoinGroupModal";
import Loading from "../Loading";
import { Users, Shield, ChevronRight } from "lucide-react";

export default function GroupList() {
    const [modal, setModal] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ['GroupList'],
        queryFn: async () => {
            const response = await api.get<GroupList[]>('/groups');
            return response.data;
        }
    })

    return (
        <div className="p-2 md:p-4 space-y-6 md:py-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-slate-800">
                        내 모임
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setModal(true)} 
                        className="px-4 py-1 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer font-medium bg-white" >
                        참가
                    </button>
                    <Link to='/groups/create' 
                        className="px-4 py-2 text-sm font-medium bg-[#3182F6] hover:bg-[#1a6fe0] text-white rounded-xl transition">
                        생성
                    </Link>
                </div>
            </div>

            {isLoading ? (<Loading />): data && data.length !== 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.map((val) => (
                        <Link to={`/groups/${val.gid}`} key={val.gid}
                            className="group flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-blue-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="flex items-center justify-center bg-slate-50 text-slate-500 rounded-xl w-8 h-8 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                                    <Users size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-medium text-slate-800 md:text-base group-hover:text-blue-600 transition-colors duration-300 truncate">
                                            {val.gname}
                                        </h3>
                                        {val.ugrole === 'admin' ? (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 shrink-0">
                                                <Shield size={10} className="hidden md:block"/>
                                                관리자
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 shrink-0">
                                                멤버
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Users size={12} className="shrink-0" />
                                            <p className="hidden md:block">멤버</p>
                                            {val.count}
                                            <p className="hidden md:block">명</p>
                                        </span>
                                        {val.gcode && (
                                            <>
                                                <span className="w-px h-2.5 bg-slate-200 shrink-0 hidden md:block"/>
                                                <span className="font-mono text-[10px] uppercase bg-slate-50 border border-slate-100 px-1 rounded tracking-wide text-slate-400 shrink-0 hidden md:block">
                                                    코드 {val.gcode}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 ml-3">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 transition-all duration-300">
                                    <ChevronRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                    <Users size={32} className="text-slate-300 mb-1" />
                    <span className="text-sm font-medium">가입된 그룹이 없습니다</span>
                </div>
            )}

            {modal && <JoinGroupModal onClose={() => setModal(false)} />}
        </div>
    )
}