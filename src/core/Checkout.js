import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import Layout from "./Layout";
import {getProducts, getBrainTreeClientToken,processPayment, createOrder} from "./apiCore";
import Card from "./Card";
import {isAuthenticated} from "../auth";
import {emptyCart} from "./CartHelpers";
import DropIn from "braintree-web-drop-in-react";

const Checkout = ({products}) =>{

    const [frontendData,setFrontendData] = useState({
        loading:false,
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

    const buy = () =>{
        setFrontendData({...frontendData, loading:true});
        let nonce;
        let getNonce = frontendData.instance.requestPaymentMethod()
            .then(data=>{
                nonce = data.nonce;
                const paymentData = {
                    paymentMethodNonce:nonce,
                    amount:getTotal(products)
                }
                processPayment(userId,token,paymentData)
                .then(response=>{
                    console.log(response);
                    let createOrderData = {
                        products:products,
                        transaction_id:response.transaction.id,
                        amount:response.transaction.amount,
                        address:data.address
                    };
                    createOrder(userId,token,createOrderData)
                    .then(response=>{
                        setFrontendData({...frontendData,success:response.success});
                        emptyCart(()=>{
                            console.log("empty cart");
                            setFrontendData({
                                loading:false,
                                success:true
                            });
    
                        })
                    })
                })
                .catch(error=>{
                    console.log(error)
                    setFrontendData({loading:false});

                })
            })
            .catch(error=>{
                console.log("error", error);
                setFrontendData({...frontendData,error:error.message});
            })
    }

    const showLoading = loading =>{
        return loading && (<h2>Loading </h2>)
    }

    const showDropIn = () =>{
        return (
            <div onBlur={()=>setFrontendData({...frontendData,error:""})}>
                {frontendData.clientToken!==null && products.length>0?(
                    <div>
                        <DropIn options={{
                            authorization:frontendData.clientToken,
                            paypal:{
                                flow:"vault"
                            }
                        }} onInstance ={instance =>(frontendData.instance = instance)}/>
                        <button onClick={buy} className="btn btn-success btn-block">Checkout</button>
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

    const showError = error =>(
        <div className="alert alert-danger" style={{display:error?"":"none"}}>
            {error}
        </div>
    )

    const showSuccess = success =>(
        <div className="alert alert-info" style={{display:success?"":"none"}}>
            Thanks your payment was successful
        </div>
    )

    return (
    <div>
        <h2>Total: ${getTotal()}</h2>
        {showLoading(frontendData.loading)}
        {showSuccess(frontendData.success)}
        {showError(frontendData.error)}
        {showCheckout()}
    </div>
    )

}


export default Checkout;