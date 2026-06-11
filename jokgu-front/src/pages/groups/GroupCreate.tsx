import { useForm } from "react-hook-form"
import type { ApiResponse, GroupCreateForm } from "../../types"
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../../api/axios"
import { toast } from "sonner";

export default function FieldCreate() {

    const { register, handleSubmit } = useForm<GroupCreateForm>();
    const navigate = useNavigate();
    const { mutate } = useMutation({
        mutationFn: async (data: GroupCreateForm) => {
            const response = await api.post<ApiResponse>('/groups/create', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("모임을 등록했어요", { style: { background: '#22c55e', color: 'white' } });
            navigate("/groups", { replace: true });
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } });
        }
    })
    const onSubmit = async (data: GroupCreateForm) => {
        mutate(data);
    }

    return (
        <div className="p-4 md:p-8 md:max-w-2xl md:mx-auto md:py-20">
            <div className="mb-8">
                <p className="text-xs font-medium text-slate-400 tracking-widest uppercase mb-1">새 모임</p>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">모임 등록</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        이름
                    </label>
                    <input id="name" type="text" placeholder="이름을 입력해주세요"
                        {...register('name', { required: true })}
                        className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#3182F6] transition placeholder:text-slate-300" />
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="desc" className="text-sm font-medium text-gray-700">
                        설명
                    </label>
                    <textarea id="desc" {...register('description', { required: true })} placeholder="어떤 모임인가요?" rows={5}
                        className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#3182F6] transition resize-none placeholder:text-slate-300" />
                </div>

                <div className="md:flex md:justify-end">
                    <button type="submit"
                        className="w-full md:w-36 py-3 text-sm font-semibold bg-[#3182F6] hover:bg-[#1a6fe0] text-white rounded-lg transition cursor-pointer" >
                        모임 만들기
                    </button>
                </div>
            </form>
        </div>
    )
}