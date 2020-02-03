import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import Layout from "./Layout";
import {getProducts, getBrainTreeClientToken} from "./apiCore";
import Card from "./Card";
import {isAuthenticated} from "../auth";
import DropIn from "braintree-web-drop-in-react";

const Checkout = ({products}) =>{

    const [frontendData,setFrontendData] = useState({
        success:false,
        clientToken:null,
        error:'',
        instance:{},
        address:''
    })

    const userId = isAuthenticated() && isAuthenticated().user._id;
    const token = isAuthenticated() && isAuthenticated().token;

    const getToken = (userId,token) =>{
        getBrainTreeClientToken(userId,token).then(data=>{
            if(data.error){
                setFrontendData({...frontendData, error:data.error})
            } else{
                setFrontendData({...frontendData,clientToken:data.clientToken})
            }
        })
    }

    const showDropIn = () =>{
        return (
            <div>
                {frontendData.clientToken!==null && products.length>0?(
                    <div>
                        <DropIn options={{
                            authorization:frontendData.clientToken
                        }} onInstance ={instance =>(frontendData.instance = instance)}/>
                        <button className="btn btn-success">Checkout</button>
                    </div>
                ):null}
            </div>
        )
    }
    useEffect(()=>{
        getToken(userId,token)
    },[])
    const getTotal = () =>{
        return products.reduce((currentValue,nextValue)=>{
            return currentValue + nextValue.count * nextValue.price
        },0);
    }

    const showCheckout =() =>{
        return isAuthenticated()?(
            <div>{showDropIn()}</div>
        ):(
            <Link to="/signin">
                <button className="btn btn-primary">Sign in to checkout</button>
            </Link>
        )
    }

    return (
    <div>
        <h2>Total: ${getTotal()}</h2>
        {showCheckout()}
    </div>
    )

}


export default Checkout;