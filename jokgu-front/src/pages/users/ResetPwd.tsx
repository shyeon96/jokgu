import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../api/axios"
import { toast } from "sonner";

export default function ResetPwd() {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    // 이메일 있나없나 조회
    const { mutate : goCheck, isPending } = useMutation({
        mutationFn: async () => {
            const response = await api.get('/users/searchemail', {params: {username}});
            console.log(response.data);
            
            return response.data.email;
        },
        onSuccess: (data) => {
            setEmail(data);
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } })
        }
    })

    // 인증 코드 보내기
    const { mutate: sendCode } = useMutation({
        mutationFn: async() => {
            const response = await api.post('/users/sendresetcode', {email})
            return response.data;
        },
        onSuccess: () => {
            toast.success("코드를 보냈습니다. 이메일을 확인해보세요", { style: { background: '#22c55e', color: 'white' } });
            setVisible(true);
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } });
        }
    })

    // 인증 코드 확인
    

    const handleSubmit = async () => { await goCheck(); }

    return (
        <div className="min-h-dvh flex flex-col gap-4 items-center p-4 md:p-8 md:py-20 ">
            <div className="max-w-sm w-full">
                <header className="flex flex-col">
                    <h2>비밀번호 초기화</h2>
                    <p>주의 !</p>
                    <p>비밀번호 초기화는 이메일을 등록한 사용자만 할 수 있습니다</p>
                    <p>사전에 이메일을 등록하지 않으셨으면 관리자에게 문의 바랍니다</p>
                </header>
                
                <div className="flex flex-col">
                    <label htmlFor="username">로그인 아이디</label>
                    <input type="text" placeholder="가입했을 때의 아이디" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    <button onClick={() => {handleSubmit()}} onKeyDown={(e) => { if(e.key === 'Enter') {handleSubmit()}}} disabled={isPending || !!email}>이메일 조회</button>
                </div>

                {email && (
                    <div>
                        <p>{email}</p>
                        <button onClick={() => {sendCode()}}>인증 코드받기</button>
                    </div>
                )}

                {visible && (
                    <div>
                        <label htmlFor="code">인증코드 입력</label>
                        <input type="text" placeholder="인증코드8자리를 입력해주세요" value={code} onChange={(e) => setCode(e.target.value)}/>
                        <button onClick={() => {}}>인증하기</button>
                    </div>
                )}
            </div>
           
        </div>
    )
}