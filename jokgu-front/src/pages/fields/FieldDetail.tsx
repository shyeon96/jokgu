import { useQueries } from "@tanstack/react-query"
import api from '../../api/axios'
import type { Fields, PlanInfo } from "../../types";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ChevronRight, CircleParking, CloudRainWind, Coins, Flame, Link2, MapPin } from "lucide-react";
import Loading from "../Loading";

interface fieldPlan {
    count: number,
    plans: PlanInfo[]
}

export default function FieldDetail() {
    const { fid } = useParams();
    const user = sessionStorage.getItem("user");

    const [{ data, isLoading, isError }, { data: planInfo, isLoading: infoLoading }] = useQueries({
        queries: [
            {
                queryKey: ['fieldDetail', fid],
                queryFn: async () => {
                    const response = await api.get<Fields>(`/fields/${fid}`);
                    return response.data;
                }
            },
            {
                queryKey: ['fieldPlanInfo', fid, user],
                queryFn: async () => {
                    const response = await api.get<fieldPlan>(`/fields/${fid}/planinfo`);
                    return response.data;
                }
            }
        ]

    })

    useEffect(() => {
        if (!data) return;
        if (data.lat && data.lng) {
            const map = new naver.maps.Map('map', {
                center: new naver.maps.LatLng(data.lat, data.lng),
                zoom: 16
            })
            new naver.maps.Marker({
                position: new naver.maps.LatLng(data.lat, data.lng),
                map: map
            });
        }
    }, [data]);

    if (isLoading) return <Loading />
    if (isError) return <div className="p-4 text-sm text-red-400">오류가 발생했습니다.</div>
    if (!data) return null;

    return (
        <div className="p-4 md:p-8 md:py-20 space-y-5">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">{data.name}</h1>
                    <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${data.isIn ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                            {data.isIn ? '실내' : '야외'}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${data.isRes ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            {data.isRes ? '예약 필수' : '자유 이용'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
                <div className="w-full overflow-hidden order-2 md:order-1 mt-4 md:mt-0 self-start">
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-300">
                        <MapPin size={15} className="shrink-0 text-slate-400 md:hidden" />
                        <span className="hidden md:block text-sm font-medium text-slate-600 shrink-0">주소</span>
                        <span className="text-sm md:text-base text-gray-700">{data.address}</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-300">
                        <Coins size={15} className="shrink-0 text-slate-400 md:hidden" />
                        <span className="hidden md:block text-sm font-medium text-slate-600 shrink-0">요금</span>
                        <span className="text-sm md:text-base text-gray-700">
                            {data.cost === "0" ? "무료" : `시간 당 ${Number(data.cost).toLocaleString()}원`}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-300">
                        <Link2 size={15} className="shrink-0 text-slate-400 md:hidden" />
                        <span className="hidden md:block text-sm font-medium text-slate-600 shrink-0">링크</span>
                        {data.url ? (
                            <a href={data.url} target="_blank" rel="noreferrer"
                                className="text-sm text-[#3182F6] hover:underline truncate">{data.url}</a>
                        ) : (
                            <span className="text-sm md:text-sm text-gray-500">없음</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-300">
                        <CircleParking size={15} className="shrink-0 text-slate-400 md:hidden" />
                        <span className="hidden md:block text-sm font-medium text-slate-600 shrink-0">주차</span>
                        <span className="text-sm md:text-base text-gray-700">
                            {data.isPark ? "주차 가능" : "주차장 없음"}
                        </span>
                    </div>
                </div>

                <div id="map" className="h-52 md:h-64 rounded-xl border border-slate-100 overflow-hidden order-1 md:order-2" />
            </div>

            {infoLoading ? (<Loading />) : (
                planInfo ? (
                    <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-6 md:mt-10">
                        <div className="flex flex-col gap-2">
                            <p className="text-base font-semibold text-slate-600">이 경기장 어때요?</p>
                            <div className="inline-flex items-center">
                                <div className="flex items-center gap-2 px-4 py-4 rounded-xl border border-slate-300">
                                    <Flame size={24} className={`${planInfo.count >= 5 ? "text-red-500" : planInfo.count >= 3 ? "text-yellow-500" : "text-gray-500"} -ml-2`}/>
                                    <span className="text-sm font-semibold text-slate-700">최근 30일 동안</span>
                                    {planInfo.count > 0 ? (
                                        <span className="text-sm font-semibold text-slate-700">
                                            <span className="text-[#3182F6]">{planInfo.count}회</span> 모임이 있었어요
                                        </span>
                                    ) : (
                                        <span className="text-sm font-medium text-slate-400">모임이 없었어요</span>
                                    )}
                                </div>
                            </div>
                            {data.isIn === 1 && (
                                <div className="inline-flex items-center">
                                <div className="flex items-center gap-2 px-4 py-4 rounded-xl border border-slate-300">
                                    <CloudRainWind size={24} className="text-blue-500 -ml-2`"/>
                                    <span className="text-sm font-semibold text-slate-700">날씨 걱정 없이 일정을 잡을 수 있어요</span>
                                </div>
                            </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-600">이 장소에서 {user}님의 최근 활동</p>
                            {planInfo.plans.length === 0 ? (
                                <div className="py-8 text-center border border-slate-100 rounded-xl">
                                    <p className="text-sm text-slate-400">새로운 장소에서 첫 모임을 시작해봐요</p>
                                </div>
                            ) : (
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    {planInfo.plans.map((plan, i) => (
                                        <Link to={`/plans/${plan.pid}`} key={plan.pid}
                                            className={`group flex justify-between items-center px-4 py-3 hover:bg-slate-50 transition ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{plan.planname}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{plan.groupname} · {plan.date.slice(0, 10)} · {plan.time.slice(0, 5)}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : <p className="text-sm text-slate-300">모임 데이터를 불러오지 못했어요</p>
            )}
        </div>
    )
}