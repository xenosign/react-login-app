import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../store/modules/users";

export default function KakaoRedirectHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const CODE = new URL(window.location.href).searchParams.get("code");
    const GRANT_TYPE = "authorization_code";
    const KAKAO_CLIENT_ID = "7d172b2d15c1f7075d4233dad7a487f0";
    const KAKAO_REDIRECT_URI = "http://localhost:3000/oauth/callback/kakao";

    console.log("카카오 코드", CODE);

    async function loginFetch() {
      const tokenResponse = await fetch(
        `https://kauth.kakao.com/oauth/token?grant_type=${GRANT_TYPE}&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&code=${CODE}`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        }
      );

      if (tokenResponse.status === 200) {
        const tokenData = await tokenResponse.json();
        console.log("카카오 토큰", tokenData);

        const userDataResponese = await fetch(
          `https://kapi.kakao.com/v2/user/me`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );

        if (userDataResponese.status === 200) {
          const userData = await userDataResponese.json();
          console.log("카카오 유저 정보", userData);

          const loginInfo = {
            type: "kakao",
            email: userData.kakao_account.email,
          };

          // 회원 가입 처리
          const registerResponse = await fetch(
            "http://localhost:4000/users/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(loginInfo),
            }
          );

          if (registerResponse.status === 200) {
            // 로그인
            dispatch(login(loginInfo));
            navigate("/");
          } else {
            alert("회원 등록 이상");
            navigate("/login");
          }
        } else {
          alert("유저 정보 받아오기 실패");
        }
      } else {
        alert("토큰 발행 실패");
      }
    }
    loginFetch();
  }, []);
}
