import { useQueries } from "@tanstack/react-query";
import api from "../api/axios";
import type { GroupList } from "../types";
import Loading from "./Loading";
import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, Clock, ExternalLink, ChevronRight, Users, Map } from "lucide-react";
import { useState } from "react";

interface todayPlan {
    pid: number,
    planname: string,
    field: string,
    time: string,
    address: string
}

interface manage {
    gid: number,
    groupname: string,
    code: string
}

export default function Main() {
    const navigate = useNavigate();
    const user = sessionStorage.getItem("user");
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [
        { data: todayPlan, isLoading: todayLoading }, 
        { data: manageGroup, isLoading: managingLoading }, 
        { data: groups, isLoading: groupLoading }] = useQueries({
        queries: [
            {
                queryKey: ['todayPlan'],
                queryFn: async () => {
                    const response = await api.get<todayPlan[]>("/main/today");
                    return response.data;
                }
            },
            {
                queryKey: ['managing'],
                queryFn: async () => {
                    const response = await api.get<manage[]>("/main/manage");
                    return response.data;
                }
            },
            {
                queryKey: ['GroupList'],
                queryFn: async () => {
                    const response = await api.get<GroupList[]>('/groups');
                    return response.data;
                },
                enabled: isOpen
            }
        ]
    })

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        return `${hours}시 ${minutes}분`;
    }

    const onClickhandler = () => {
        setIsOpen(true);
    }

    return (
        <div className="p-2 md:p-4 space-y-6 md:space-y-10 md:py-20">
            <div className="bg-gradient-to-r from-[#3182F6] to-[#6366f1] rounded-2xl p-5 text-white">
                {todayLoading ? <Loading /> : 
                <>
                    <h1 className="text-lg md:text-xl font-bold truncate"> {user}님!</h1>
                    <p className="text-xs md:text-sm text-blue-100 mt-1">오늘 예정된 일정이 {todayPlan?.length ?? 0}개 있습니다.</p>
                </>}
                
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <div className="flex justify-between items-center text-sm text-gray-900 mb-3">
                            <Link to="/plans" className="text-base font-semibold text-gray-900">오늘의 일정</Link>
                            <Link to="/plans" title="예정된 일정 보기">
                                <ExternalLink size={16} className="transition-transform duration-200 hover:scale-110" />
                            </Link>
                        </div>

                        {todayLoading ? (
                            <Loading />
                        ) : todayPlan && todayPlan.length !== 0 ? (
                            <div className="space-y-2">
                                {todayPlan.map((plan) => (
                                    <Link key={plan.pid} to={`/plans/${plan.pid}`}
                                        className="group flex items-center justify-between bg-white border border-slate-100 hover:border-blue-100 rounded-xl p-3.5 transition-all duration-300 shadow-sm hover:shadow-md" >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="flex items-center gap-1.5 text-blue-600 shrink-0">
                                                <Clock size={16} className="text-blue-500 shrink-0" />
                                                <span className="text-sm font-medium">{formatTime(plan.time)}</span>
                                            </div>
                                            <span className="w-px h-3.5 bg-slate-200 shrink-0" />
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-slate-700 text-sm md:text-base group-hover:text-blue-600 transition-colors duration-300 truncate">
                                                    {plan.planname}
                                                </h3>
                                                <p className="hidden md:flex items-center gap-1 text-xs text-slate-400 mt-0.5 truncate">
                                                    <Map size={14} className="text-slate-400 shrink-0" />
                                                    {plan.field}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0 ml-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 transition-all duration-300">
                                                <ChevronRight size={16} />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : <div className="p-5 text-center text-slate-400 text-sm">
                            오늘은 일정이 없어요
                        </div>}
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-gray-900 mb-3">내가 관리하는 모임</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {managingLoading ? (
                                <Loading />
                            ) : manageGroup && manageGroup.length !== 0 ? (
                                manageGroup.map((group) => (
                                    <Link to={`/groups/${group.gid}`} key={group.gid}
                                        className="group flex items-center justify-between bg-white border border-slate-100 hover:border-blue-100 rounded-xl p-3.5 transition-all duration-300 shadow-sm hover:shadow-md" >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex items-center justify-center bg-slate-50 text-slate-500 rounded-lg w-8 h-8 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                                                <Users size={16} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="font-medium text-slate-700 text-sm group-hover:text-blue-600 transition-colors duration-300 truncate">
                                                    {group.groupname}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="shrink-0 ml-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 transition-all duration-300">
                                                <ChevronRight size={16} />
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : <div className="w-full md:col-span-2 p-5 text-center text-slate-400 text-sm">
                                관리중인 그룹이 없습니다
                            </div>}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-base font-semibold text-gray-900 mb-3">빠른 생성</h2>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                            <button onClick={() => navigate("/groups/create")}
                                className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-gray-200 transition-all duration-300 hover:shadow-sm">
                                <Users size={20} color="#3182F6" />
                                <span className="text-sm font-medium">모임 만들기</span>
                            </button>
                            <button onClick={() => onClickhandler()} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-gray-200 transition-all duration-300 hover:shadow-sm">
                                <CalendarPlus size={20} color="#f43f5e" />
                                <span className="text-sm font-medium">일정 만들기</span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
                    <div className="bg-white rounded-2xl p-4 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-base font-semibold text-slate-800 mb-4">그룹 선택</h2>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {groupLoading ? (
                                <Loading />
                            ) : groups && groups.length !== 0 ? (
                                groups.map((group) => (
                                    <button key={group.gid} onClick={() => { setIsOpen(false); navigate(`/groups/${group.gid}/create`); }}
                                        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-left cursor-pointer">
                                        <div className="flex items-center rounded-lg shrink-0 gap-2">
                                            <span className="text-sm">{group.gname}</span>
                                        </div>
                                        <div className="flex gap-1 items-center text-gray-600">
                                            <Users size={12} />
                                            <p className="text-sm">{group.count}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-4">참여한 그룹이 없어요</p>
                            )}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-full mt-4 py-2.5 text-sm text-slate-500 rounded-xl hover:text-slate-700 hover:bg-gray-100 transition-colors cursor-pointer">
                            취소
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
