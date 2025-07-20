import { authClient } from "~/lib/auth-client";
import type { Route } from "./+types/auth";
import { LoginForm } from "~/components/login-form";
import { redirect } from "react-router";
import { act } from "react";

export async function clientAction({request}:Route.ActionArgs){
    const formData=await request.formData();
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const mode = formData.get('mode')
    // console.log(formData)
    console.log("Email and Password", email,password,mode)
    const errors:{
        email?:string,
        password?:string,
        general?:string,
    }={}
    if (!email || email.trim()===''){
        errors.email='Email Missing and is Required'
    }else if(!email.includes('@')){
        errors.email='Email must be Valid and include an @ symbol'
    }

    if (!password || password.trim()=== ''){
        errors.password= 'Password is missing and is Required'
    }else if(password.length < 7){
        errors.password='Password must be atleast 7 characters long'
    }

    if (Object.keys(errors).length >0){
        return{errors}
    }

    if (mode === 'login'){
        try{
           const response=await authClient.signIn.email({
                email,
                password
            }) 
             console.log('Here is the response',response)
                 console.log(email,password)
              if (response.error){
                return {errors : {general : response.error.message}}
        }
        }catch (err) {
            console.log(err)
        }
       
    }else{
         const response=await authClient.signUp.email({
            email,
            name:email,
            password,
        })
        if (response.error){
            console.log(response.error)
            return {errors : {general : response.error.message}}
        }
    }
    console.log(errors)
    return redirect('/video')
}
export default function AuthRoute({actionData}:Route.ComponentProps){
    const errors=actionData?.errors || {}
    return(
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm/>
            </div>
        </div>
    )
}
