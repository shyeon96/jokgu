import { useMutation, useQueries } from "@tanstack/react-query"
import api from "../../api/axios";
import type { ApiResponse, Match, PlanDetailResponse } from "../../types";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, MapPin, MoreHorizontal, Trophy, Map } from "lucide-react";
import Loading from "../Loading";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";

interface Dateset {
    matches: Match[],
    total: {
        uid: number,
        name: string,
        win: number,
        lose: number,
        price: number
    }[]
}

interface liveScore {
    aScore: number,
    bScore: number,
    aSetScore: number,
    bSetScore: number
}

export default function PlanDetail() {
    const { pid } = useParams();
    const mapRef = useRef<HTMLDivElement>(null);
    const naverRef = useRef<any>(null);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const socket = useRef<Socket | null>(null);
    const [liveScore, setLiveScore] = useState<liveScore | null>(null);

    useEffect(() => {
        socket.current = io(import.meta.env.VITE_WEBSOKET_URL, {
            auth: {
                token: sessionStorage.getItem('token')
            }
        });

        socket.current.on('connect', () => {
            socket.current?.emit('join', String(pid));
        })

        socket.current?.on("matchEnd", () => { setLiveScore(null); })
        socket.current?.on("nowScore", (data) => { setLiveScore(data)})
        return () => { socket.current?.disconnect(); }
    }, [pid])

    const [{ data: plan, isLoading: planLoading }, { data: data, isLoading: matchesLoading }] = useQueries({
        queries: [
            {
                queryKey: ['planDetail', pid],
                queryFn: async () => {
                    const response = await api.get<PlanDetailResponse>(`/plans/${pid}`);
                    return response.data;
                }
            },
            {
                queryKey: ['matches', pid],
                queryFn: async () => {
                    const response = await api.get<Dateset>(`/plans/${pid}/matches`);
                    return response.data;
                }
            }
        ]
    })

    const { mutate: deletePlan } = useMutation({
        mutationFn: async () => {
            const response = await api.delete<ApiResponse>(`/plans/${pid}`)
            return response.data;
        },
        onSuccess: () => {
            toast.success("일정을 삭제하였습니다.", { style: { background: '#22c55e', color: 'white' } });
            navigate("/plans", { replace: true });
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } });
        }
    })

    useEffect(() => {
        const handler = () => setMenuOpen(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    useEffect(() => {
        if (!plan?.lat || !plan?.lng) return;
        if (!mapRef.current) return;

        const map = new naver.maps.Map(mapRef.current, {
            center: new naver.maps.LatLng(plan.lat, plan.lng),
            zoom: 16
        });
        new naver.maps.Marker({
            position: new naver.maps.LatLng(plan.lat, plan.lng),
            map: map
        });
        naverRef.current = map;
    }, [plan]);

    const formatTime = (timeStr: string) => {
        const hours = timeStr.split(':')[0];
        const minutes = timeStr.split(':')[1];
        return `${hours}시 ${minutes}분`;
    }

    if (planLoading) return <Loading />
    if (!plan) return <div className="p-4 text-sm text-gray-400">일정 데이터를 불러오지 못했습니다.</div>

    return (
        <div className="p-4 md:p-6 space-y-8 md:py-20">
            <div className="flex flex-col md:flex-row md:gap-8">
                <div className="flex flex-col gap-4 mb-4 md:mb-0 md:flex-1">
                    <div className="flex justify-between md:mr-4">
                        <div>
                            <p className="text-xs font-medium text-slate-600 tracking-widest uppercase mb-1">{plan.groupname}</p>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{plan.planname}</h1>
                        </div>
                        <div className="relative shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                                className="hover:bg-slate-50 transition text-slate-600 cursor-pointer">
                                <MoreHorizontal size={20} />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                                    <button
                                        onClick={() => { setMenuOpen(false); deletePlan(); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                                        일정 삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-500">
                            <Map size={16} className="shrink-0 text-slate-400 md:hidden" />
                            <span className="hidden md:block text-xs font-medium text-slate-400 w-10 shrink-0">장소</span>
                            <span>{plan.fieldname}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-500">
                            <MapPin size={16} className="shrink-0 text-slate-400 md:hidden" />
                            <span className="hidden md:block text-xs font-medium text-slate-400 w-10 shrink-0">주소</span>
                            <span>{plan.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-500">
                            <Calendar size={16} className="shrink-0 text-slate-400 md:hidden" />
                            <span className="hidden md:block text-xs font-medium text-slate-400 w-10 shrink-0">날짜</span>
                            <span>{plan.date.slice(0, 10)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-500">
                            <Clock size={16} className="shrink-0 text-slate-400 md:hidden" />
                            <span className="hidden md:block text-xs font-medium text-slate-400 w-10 shrink-0">시간</span>
                            <span>{formatTime(plan.time)}</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-400 mb-2">참가자</p>
                        {matchesLoading ? (
                            <Loading />
                        ) : data?.total && data.total.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {data.total.map((user) => (
                                    <div key={user.uid} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#EEF4FF] flex items-center justify-center text-[10px] font-medium text-[#3182F6] shrink-0">
                                            {user.name[0]}
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-300">참가자가 없습니다</p>
                        )}
                    </div>
                </div>
                <div ref={mapRef} className="w-full h-52 md:w-80 md:shrink-0 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 md:hover:w-[480px] md:hover:h-[480px]"
                    onMouseEnter={() => {
                        setTimeout(() => {
                            if (plan?.lat && plan?.lng) {
                                naver.maps.Event.trigger(naverRef.current, 'resize');
                                naverRef.current?.setCenter(new naver.maps.LatLng(plan.lat, plan.lng));
                            }
                        }, 300);
                    }}
                    onMouseLeave={() => {
                        setTimeout(() => {
                            if (plan?.lat && plan?.lng) {
                                naver.maps.Event.trigger(naverRef.current, 'resize');
                                naverRef.current?.setCenter(new naver.maps.LatLng(plan.lat, plan.lng));
                            }
                        }, 300);
                    }}
                />
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">

                <div className="space-y-2">
                    <div className="flex justify-between items-center pr-2">
                        <h2 className="text-sm font-medium text-slate-400">경기 목록</h2>
                        {liveScore ? (
                            <span className="text-sm text-slate-300 cursor-not-allowed transition" title="진행중인 경기가 있어 추가할 수 없습니다">추가</span>
                        ) : (
                        <Link to={`/plans/${pid}/newmatch`} className="text-sm text-[#3182F6] hover:text-blue-700 transition">
                            추가
                        </Link>
                    )}
                    </div>

                    {matchesLoading ? (
                        <Loading />
                    ) : !data?.matches ? (
                        <div className="text-sm text-gray-400 px-1">경기를 불러오지 못했습니다.</div>
                    ) : data.matches.length === 0 ? (
                        <div className="flex items-center justify-center py-10 text-sm text-slate-500 border border-slate-200 rounded-xl">
                            등록된 경기가 없습니다
                        </div>
                    ) : (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            {data.matches.map((match: Match, i: number) => (
                                <Link key={match.mid} to={`/plans/${pid}/matches/${match.mid}`}
                                    className={`group flex justify-between items-center px-4 py-3 hover:bg-slate-50 transition ${i !== 0 ? 'border-t border-slate-200' : ''}`} >
                                    <div className="flex items-center gap-2">
                                        <Trophy size={15} className="text-[#3182F6] shrink-0" />
                                        <span className="text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{match.winner} 팀 승</span>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                                        {match.game === 'single' ? '단판' : '3판 2선'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-slate-500">정산 현황</h2>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500">
                            <span>이름</span>
                            <span className="text-center">전적</span>
                            <span className="text-end">벌금</span>
                        </div>
                        {matchesLoading ? (
                            <div className="py-6"><Loading /></div>
                        ) : !data?.total || data.total.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-500">데이터가 없습니다</div>
                        ) : (
                            data.total.map((user, i) => (
                                <div key={user.uid} className={`grid grid-cols-3 px-4 py-3 items-center ${i !== 0 ? 'border-t border-slate-200' : ''}`}>
                                    <span className="text-sm text-gray-900">{user.name}</span>
                                    <div className="flex justify-center gap-2 text-sm">
                                        <span className="text-blue-500">{user.win}승</span>
                                        <span className="text-red-500">{user.lose}패</span>
                                    </div>
                                    <span className="text-sm text-gray-900 text-end">{user.price.toLocaleString()}원</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {liveScore && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-lg max-w-sm mx-auto">
                        <p className="text-xs font-medium text-slate-400">실시간 점수</p>
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-2xl font-bold text-red-400">A</span>
                            <span className="text-4xl font-bold text-gray-900">{liveScore.aScore} : {liveScore.bScore}</span>
                            <span className="text-2xl font-bold text-blue-400">B</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-sm text-slate-500">세트</span>
                            <span className="text-sm text-slate-500">{liveScore.aSetScore} : {liveScore.bSetScore}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}