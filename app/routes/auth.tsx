import type { Route } from "./+types/auth";
import { LoginForm } from "~/components/login-form";

export async function action({request}:Route.ActionArgs){
    const formData=await request.formData();
    const email = formData.get('email')
    const password = formData.get('password')
    const name = formData.get('email')

    console.log(email,password)
}
export default function AuthRoute(){
    return(
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm/>
            </div>
        </div>
    )
}