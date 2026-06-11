import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import type { GroupList, Plan } from "../../types";
import { Calendar, ClipboardList, Users, X } from "lucide-react";
import Loading from "../Loading";
import { useState } from "react";

export default function ScheduledPlans() {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    const { data: plans, isLoading } = useQuery({
        queryKey: ['ScheduledPlans'],
        queryFn: async () => {
            const response = await api.get<Plan[]>('/plans');
            return response.data;
        }
    })

    const { data: groups, isLoading: groupsLoading } = useQuery({
        queryKey: ['GroupList'],
        queryFn: async () => {
            const response = await api.get<GroupList[]>('/groups');
            return response.data;
        },
        enabled: isOpen
    });

    return (
        <div className="p-4 md:py-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-slate-800">예정된 일정</h1>
                <button onClick={() => setIsOpen(true)} className="px-4 py-2 text-sm font-medium bg-[#3182F6] hover:bg-[#1a6fe0] text-white rounded-xl transition shadow-sm">
                    추가
                </button>
            </div>

            {isLoading ? (
                <Loading />
            ) : plans && plans.length > 0 ? (
                <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
                    {plans.map((plan) => (
                        <Link key={plan.pid} to={`/plans/${plan.pid}`}
                            className="group flex flex-col gap-3 p-4 hover:bg-slate-50 transition border border-slate-100 rounded-xl">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-1.5">
                                    <ClipboardList size={14} className="shrink-0 text-slate-400 mt-0.5" />
                                    <p className="text-sm font-medium text-slate-800 md:text-base group-hover:text-blue-600 transition-colors">{plan.planname}</p>
                                </div>
                                <span className="hidden md:block text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full shrink-0">{plan.groupname}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="shrink-0 text-slate-400" />
                                    <span>{plan.date.slice(0, 10)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users size={14} className="shrink-0 text-slate-400" />
                                    <span>{plan.count}명</span>
                                </div>
                            </div>

                            <div className="hidden md:flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="text-xs font-medium text-slate-400 w-10 shrink-0">시간</span>
                                    <span>{plan.time.slice(0, 5)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="text-xs font-medium text-slate-400 w-10 shrink-0">장소</span>
                                    <span className="truncate">{plan.fieldname}</span>
                                </div>
                            </div>

                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <span className="text-md">예약된 일정이 없습니다</span>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
                    <div className="bg-white rounded-2xl p-5 w-80 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-semibold text-slate-800">모임 선택</h2>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <X size={18} />
                            </button>
                        </div>

                        {groupsLoading ? (
                            <Loading />
                        ) : groups && groups.length > 0 ? (
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                {groups.map((group, i) => (
                                    <button key={group.gid}
                                        onClick={() => { setIsOpen(false); navigate(`/groups/${group.gid}/create`); }}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                        <p className="text-sm font-medium text-slate-500 md:text-base hover:text-slate-800">{group.gname}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-sm text-slate-400">
                                가입된 모임이 없습니다
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}