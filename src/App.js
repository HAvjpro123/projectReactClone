// import { useQuery } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from './routes'
import React, { Fragment, useEffect, useState } from "react";
import DefaultComponent from "./Components/DefaultComponent/DefaultComponent";
import { isJsonString } from "./utils";
import { jwtDecode } from "jwt-decode";
import * as UserService from './service/UserService'
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from "./redux/slides/userSlide";


export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)

  useEffect(() => {
    const { storageData, decoded } = handleDecoded()
    if (decoded?.id) {
      handleGetDetailsUser(decoded?.id, storageData)
    }
  }, []);
  
  const handleGetDetailsUser = async (id, token) => {
    const res = await UserService.getDetailsUser(id, token)
    dispatch(updateUser({ ...res?.data, access_token: token }))
  }

  const handleDecoded = () => {
    let storageData = localStorage.getItem('access_token')
    let decoded = {}
    if (storageData && isJsonString(storageData)) {
      storageData = JSON.parse(storageData)
      decoded = jwtDecode(storageData)
    }
    return { decoded, storageData }
  }

  UserService.axiosJWT.interceptors.request.use(async (config) => {
    // Do something before request is sent
    const currentTime = new Date()
    const { decoded } = handleDecoded()
    if (decoded?.exp < currentTime.getTime() / 1000) {
      const data = await UserService.refreshToken()
      config.headers['token'] = `Bearer ${data?.access_token}`
    }
    return config;
  }, (err) => {
    return Promise.reject(err);
  });


  // const dispatch = useDispatch();

  // useEffect( () => {
  //   const { storageData, decoded } = handleDecoded()
  //   console.log("storageData", storageData, isJsonString(storageData))
  //   console.log("decoded", decoded)
  //   if (decoded?.id) {
  //     handleGetDetailsUser(decoded?.id, storageData)
  //   }
  // }, [])

  // const handleDecoded = () => {
  //   let storageData = localStorage.getItem('access_token')
  //   let decoded = {}
  //   if (storageData && isJsonString(storageData)) {
  //     storageData = JSON.parse(storageData)
  //     decoded = jwtDecode(storageData)
  //   }
  //   return { decoded, storageData }
  // }

  // UserService.axiosJWT.interceptors.request.use(async (config) => {
  //   const currentTime = new Date()
  //   const { decoded } = handleDecoded()
  //   if (decoded?.exp < currentTime.getTime() / 1000) {
  //     const data = await UserService.refreshToken()
  //     config.headers['token'] = `Bearer ${data?.access_token}`
  //   }
  //   return config;
  // }, (error) =>{
  //   return Promise.reject(error);
  // });

  // const handleGetDetailsUser = async (id, token) => {
  //   const res = await UserService.getDetailsUser(id, token)
  //   dispatch(updateUser({ ...res?.data, access_token: token }))
  // }


  return (
    <div>
         <Router>
            <Routes>
              {routes.map((route) => {
                const Page = route.page
                const ischeckAuth = !route.isPrivate || user.isAdmin
                const Layout = route.isShowHeader ? DefaultComponent : Fragment
                return (
                  <Route key={route.path} path={ischeckAuth ? route.path : undefined} element={(
                    <Layout>
                      <Page />
                    </Layout>
                  )} />
                )
              })}
            </Routes>
          </Router>
    </div>
  );
}


