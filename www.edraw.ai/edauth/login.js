let pid = window.getProductIDByCookie ? window.getProductIDByCookie() : ""
const siginIn = document.getElementById("ed-uinfo-log-wrapper");
const logout = document.getElementById("ed-uinfo-logout");
const authSuccessCb = (userInfor) => {
  siginIn.style.display = "none";
  document.getElementById("ed-uinfo-logged-wrapper").classList.remove("d-none");
  document.getElementById("ed-uinfo-avatar").innerText = userInfor.nick_name;
};
const authFailCb = () => {};
const checkLogin = () => {
  window.edAiAuth
    .checkLocalCookie({
        product: pid,
    })
    .then((userInfor) => {
      authSuccessCb(userInfor);
    })
    .catch(() => {
      window.edAiAuth.auth(authSuccessCb, authFailCb, {
        product: pid,
    });
    });
};
setTimeout(() => {
  pid = window.getProductIDByCookie ? window.getProductIDByCookie() : ""
  checkLogin();
}, 1000)

siginIn.addEventListener("click", () => {
  window.edAiAuth.show({
      product: pid,
  });
});
logout.addEventListener("click", () => {
  window.edAiAuth.logout();
});
