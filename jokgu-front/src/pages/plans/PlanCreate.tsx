import { useMutation, useQueries } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom"
import api from "../../api/axios";
import type { Fields } from "../../types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loading from "../Loading";
import { AlertCircle } from "lucide-react";

interface users {
    uid: number,
    name: string,
    role: string
}

interface PlanFormData {
    name: string;
    date: string;
    time: string;
    fid: string;
    uid: string[];
  }

export default function PlanCreate() {
    const { gid } = useParams();
    const { register, handleSubmit } = useForm<PlanFormData>();
    const navigate = useNavigate();

    const [
        { data: fields, isLoading: fieldsLoading },
        { data: users, isLoading: usersLoading }
    ] = useQueries({
        queries: [
            {
                queryKey: ['FieldList'],
                queryFn: async () => {
                    const response = await api.get<Fields[]>('/fields');
                    return response.data;
                }
            },
            {
                queryKey: ['userList', gid],
                queryFn: async () => {
                    const response = await api.get<users[]>(`/groups/${gid}/userlist`);
                    return response.data;
                }
            },
        ]
    })

    const { mutate } = useMutation({
        mutationFn: async (data: PlanFormData) => {
            const response = await api.post(`/groups/${gid}/create`, data);
            return response.data;
        },
        onSuccess: () => {
                toast.success("일정을 등록했어요", { style: { background: '#22c55e', color: 'white' } });
                navigate(`/groups/${gid}`, { replace: true });
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } })
        }
    })

    const onSubmit = async (data: PlanFormData) => {
        mutate(data);
    }
    
    return (
        <div className="p-4 md:py-20">
            <h1 className="text-xl font-medium text-gray-900 mb-6">일정 등록</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="md:grid md:grid-cols-2 md:gap-4 flex flex-col gap-5">

                    <div className="flex flex-col gap-1.5 col-span-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">이름</label>
                        <input id="name" type="text"
                            {...register('name', { required: true, maxLength: 30, minLength: 4 })}
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition"
                            maxLength={30} minLength={4}
                            placeholder="예) **모임 정기 일정"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="date" className="text-sm font-medium text-gray-700">날짜</label>
                        <input id="date" type="date"
                            min={new Date().toLocaleDateString('en-CA')}
                            {...register('date', { required: true })}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="time" className="text-sm font-medium text-gray-700">시작 시간</label>
                        <input id="time" type="time"
                            {...register('time', { required: true })}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition"
                        />
                    </div>
                </div>

                {fieldsLoading ? <Loading /> : fields ?
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="field" className="text-sm font-medium text-gray-700">위치</label>
                        <select id="field" {...register('fid', { required: true })}
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition bg-white">
                            <option value="">장소를 선택해주세요</option>
                            {fields?.map((field) => (
                                <option value={field.id} key={field.id}>
                                    {field.name}
                                </option>
                            ))}
                        </select>
                    </div> : 
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-500">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        경기장 정보를 불러오는데 실패했습니다
                    </div>}

                {usersLoading ? <Loading /> : users ?
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">참여 인원</label>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {users?.map((user, i) => (
                                <label key={user.uid} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                                    <input type="checkbox" value={user.uid} {...register('uid')} className="w-4 h-4 accent-[#3182F6]" />
                                    <div className="w-8 h-8 rounded-full bg-[#EEF4FF] flex items-center justify-center text-xs font-medium text-[#3182F6] flex-shrink-0">
                                        {user.name[0]}
                                    </div>
                                    <span className="text-sm text-gray-800">{user.name}</span>
                                </label>
                            ))}
                        </div>
                    </div> :
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-500">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        멤버 정보를 불러오는데 실패했습니다
                    </div>}

                <button type="submit" className="w-full py-2.5 text-sm font-medium bg-[#3182F6] hover:bg-[#1a6fe0] text-white rounded-lg transition cursor-pointer mt-2">
                    활동 추가
                </button>
            </form>
        </div>
    )
}