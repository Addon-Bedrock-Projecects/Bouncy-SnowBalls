import * as UI from 'mojang-minecraft-ui';
import { Player, world } from "mojang-minecraft";

export const ActionFormType='actionForm';
export const ModalFormType='modalForm';
export const MsgFormType='msgForm';

export const ToggleControlType='toggle';
export const ButtonControlType='button';
export const DropdownControlType='dropdown';
export const IconControlType='icon';
export const SliderControlType='slider';
export const TextBoxControlType='textField';

export const NativeInfoForm='nativeInfo';
export const NativePromptInfoForm='nativePromptForm';
export const NativeConfirmInfoForm='nativeConfirmInfoForm';

export const FormOutputTypes= {
    [ModalFormType]:'formValues',
    [ActionFormType]:'selection',
    [MsgFormType]:'selection'
}
export const FormClasses={
    [ModalFormType]:UI.ModalFormData,
    [MsgFormType]:UI.MessageFormData,
    [ActionFormType]:UI.ActionFormData
}
export const FormTypes={
    ActionForm: ActionFormType,
    MessageForm: MsgFormType,
    MsgForm: MsgFormType,
    ModalForm: ModalFormType
}
export const ControlTypes = {
    Toggle:ToggleControlType,
    Dropdown:DropdownControlType,
    Icon:IconControlType,
    Slider:SliderControlType,
    TextBox:TextBoxControlType,
    TextField:TextBoxControlType
}
export class FormBuilder{
    static registry(key,value){
        return UIBuilder.registry(key,value);
    }
    static show(player,key,...buildParams){
        return UIBuilder.show(player,key,...buildParams);
    }
}
class UIBuilder{
    static registry(keys,formStructure)
    {
        if (typeof(keys) === 'object') {
            keys.forEach((value,key)=>{
                UIForms[key] = value;
            });
        }
        else{
            UIForms[keys] = formStructure;
        }
    }
    static async show(player,key,...BuildParams){
        const theGlobal = {};
        try {
            const Form = UIForms[key];
            const type = Form.type;
            let eventData = await this.build(key,theGlobal,...BuildParams).show(player);
            Object.assign(eventData,{output:eventData[FormOutputTypes[UIForms[key]['type']]]});
            if(Form.callBack instanceof Function) Form.callBack.runAsAsync(eventData,player,theGlobal,...BuildParams);
            if(Form.safeCallBack instanceof Function && ((!eventData.isCanceled && type!==MsgFormType) || (Boolean(eventData.output) && type===MsgFormType))) Form.safeCallBack.runAsAsync(eventData,player,theGlobal,...BuildParams);
            return {eventData:eventData,theGlobal:theGlobal};
        } catch (error) {
            await UIBuilder.show(player,NativeInfoForm,"Form Building Error","§4" + error.name +"\n" + error.message + "\n" + error.stack);
            const e = new Error(error.name + "  " + error.message);
            e.name = "Form Building Error";
            e.stack = error.stack;
            throw e;
        }
    }
    static build(key,...params)
    {
        let ThisForm = UIForms[key];
        let type = ThisForm['type'];
        let FormData = new FormClasses[type]();
        let Value = ThisForm['value'];
        this.buildFunc[type](FormData,Value,...params);
        return FormData;
    }
    static buildFunc = {
        [ActionFormType](form,Values,...params){
            form.title(Values.getValue('title',...params)??"");
            form.body(Values.getValue('body',...params)??"");
            let vls = Values.getValue('buttons',...params)??'';
            if (Array.isArray(vls)) {
                vls.forEach((button)=>{
                    Set((...args)=>form.button(...args),button);
                });
            }
            else if (typeof(vls)!='object'){
                form.button(vls+'');
            }
        },
        [MsgFormType](form,Values,...params){
            for (const key in Values) {
                if (Object.hasOwnProperty.call(Values, key)) {
                    const element = Values.getValue(key,...params);
                    Set((...args)=>form[key](...args),element);
                }
            }
        },
        [ModalFormType](form,Values,...params){
            form.title(Values.getValue('title',...params));
            let vls = Values.getValue('values',...params)??'';
            if (Array.isArray(vls)) {
                vls.forEach((controls)=>{
                    Set((...args)=>form[controls['type']](...args),controls.getValue('values',...params));
                });
            }
            else {
                Set((...args)=>{form[vls['type']](...args)},vls.getValue('values',...params));
            }
        },
    }
}
function Set(functs,object,thisObject) {
    if (Array.isArray(object)) {
       return functs.call(thisObject,...(object));
    } else {
    return functs.call(thisObject,object);
    }
}
let UIForms = {};
export default UIForms;
const NativeForms = {
    [NativeInfoForm]:{
        type:MsgFormType,
        value:{
            title:(n,title)=>title+"",
            body:(n,title,body)=>body + "",
            button1:function (s){return arguments[3]??"ok"},
            button2:function (s){return arguments[4]??"§4cancel"}
        },
        callBack(n){
            if(arguments[5] == undefined)
                return;
            try {
                arguments[5](...arguments);
            } catch (error) {
                console.warn(error.stack);
            }
        }
    },
    [NativePromptInfoForm]:{
        type:ModalFormType,
        value:{
            title:"Prompt",
            values:[
                {
                    type:TextBoxControlType,
                    values(n,a="",b=""){
                        return [a,b,b];
                    }
                }
            ]
        },
        callBack(params,sender,n,a,b,callBack){
            callBack(params.output);
        }
    },
    [NativeConfirmInfoForm]:{
        type:MsgFormType,
        value:{
            title:"Confirm",
            body:(a,n)=>n,
            button1:"ok",
            button2:"cancel"
        },
        callBack(n,s,o,msg,callBack){
            callBack(Boolean(n.output));
        }
    }
};
const toGlobe = {
    prompt(msg,def){
        if (this instanceof Player) {
            return new Promise(res=>{
                FormBuilder.show(this,NativePromptInfoForm,msg,def,res);
            });
        }
        throw new Error("No player defined");
    },
    confirm(msg){
        if (this instanceof Player) {
            return new Promise(res=>{
                FormBuilder.show(this,NativeConfirmInfoForm,msg,res);
            });
        }
        throw new Error("No player defined");
    }
};
Object.assign(globalThis,toGlobe);
world.events.serverImport.subscribe((params)=>UIBuilder.registry(NativeForms));