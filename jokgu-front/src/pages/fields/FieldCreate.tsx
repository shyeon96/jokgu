import { useForm } from "react-hook-form"
import type { ApiResponse, FieldsCreateForm } from "../../types"
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../../api/axios"
import { useState } from "react";
import { toast } from "sonner";


export default function FieldCreate() {

    const { register, handleSubmit, setValue } = useForm<FieldsCreateForm>();
    const navigate = useNavigate();
    const [detailAddr, setDetailAddr] = useState<string>('');

    const { mutate } = useMutation({
        mutationFn: async (data: FieldsCreateForm) => {

            const response = await api.post<ApiResponse>('/fields', {
                ...data,
                cost: data.cost || "0",
                address: `${data.address} ${detailAddr}`,
                is_indoor: data.is_indoor ? 1 : 0,
                is_reservable: data.is_reservable ? 1 : 0,
                is_parking: data.is_parking ? 1 : 0
            });
            return response.data;
        },
        onSuccess: () => {
                toast.success("추가 완료", { style: { background: '#22c55e', color: 'white' } });
                navigate("/fields", { replace: true });
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } })
        }
    })

    const onSubmit = async (data: FieldsCreateForm) => {
        mutate(data);
    }

    // 카카오 주소검색
    const addressSearch = () => {
        new daum.Postcode({
            oncomplete: (data: any) => {
                setValue('address', data.address);
            }
        }).open();
    }

    return (
        <div className="p-4 md:py-20">
            <h1 className="text-xl font-medium text-gray-900 mb-7">경기장 등록</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-500">이름*</label>
                    <input type="text" {...register('name', { required: true })} placeholder="경기장 이름"
                        className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition max-w-[480px]" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-500">주소*</label>
                    <div className="flex gap-2 max-w-[480px] min-w-0">
                        <input type="text" {...register('address', { required: true })} placeholder="주소 검색" readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 outline-none min-w-0" />
                        <button type="button" onClick={addressSearch}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition whitespace-nowrap" >
                            주소 찾기
                        </button>
                    </div>
                    <input type="text" value={detailAddr} onChange={(e) => setDetailAddr(e.target.value)} placeholder="상세주소"
                        className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition" />
                </div>

                <div className="flex flex-col gap-5 md:gap-10 md:flex-row">

                    <div className="flex flex-col gap-1 flex-1 md:self-start max-w-[480px]">
                        <label className="text-sm text-gray-500">추가 정보</label>
                        <div className="w-full flex-1 md:self-start border border-gray-200 rounded-xl px-4 max-w-[480px]">

                            <div className="flex items-center justify-between py-3.5">
                                <span className="text-sm text-gray-900">실내 경기장</span>
                                <input type="checkbox" {...register('is_indoor')}
                                    onChange={(e) => setValue('is_indoor', e.target.checked ? 1 : 0)}
                                    className="w-4 h-4 accent-blue-500" />
                            </div>
                            <div className="flex items-center justify-between py-3.5 border-t border-gray-100">
                                <span className="text-sm text-gray-900">예약 가능</span>
                                <input type="checkbox" {...register('is_reservable')}
                                    onChange={(e) => setValue('is_reservable', e.target.checked ? 1 : 0)}
                                    className="w-4 h-4 accent-blue-500" />
                            </div>
                            <div className="flex items-center justify-between py-3.5 border-t border-gray-100">
                                <span className="text-sm text-gray-900">주차 여부</span>
                                <input type="checkbox" {...register('is_parking')}
                                    onChange={(e) => setValue('is_parking', e.target.checked ? 1 : 0)}
                                    className="w-4 h-4 accent-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 max-w-[480px] justify-between">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-500">시간당 가격</label>
                            <input type="text" {...register('cost')} placeholder="예: 3000 (무료면 비워두세요)"
                                className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-500">예약 URL</label>
                            <input type="url" {...register('url')} placeholder="https://"
                                className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition" />
                        </div>
                    </div>

                </div>

                <button type="submit" className="mt-6 py-3 font-medium bg-[#3182F6] hover:bg-[#1a6fe0] text-white rounded-xl transition cursor-pointer max-w-[480px] mx-auto block w-full">
                    등록하기
                </button>
            </form>
        </div>
    )
}