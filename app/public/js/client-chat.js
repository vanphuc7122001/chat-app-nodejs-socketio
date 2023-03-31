const socket = io();

let form = document.getElementById("form-msg");
let input = document.getElementById("input-msg");
let shareLocation = document.getElementById("btn-share-location");
let renderUserList = document.getElementById("app__list-user--content");
let renderNameRoom = document.getElementById("app__title");
let renderMessage = document.getElementById("app__messages");

const checkBadWords = (errors) => {
  if (errors) {
    return alert(errors);
  }
  console.log("Bạn đả gửi tin nhắn thành công");
};

// gửi vị trí latitude: vỉ độ , longtitude : kinh độ
shareLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Trình duyệt hổ trợ tìm vị trí");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    // console.log(latitude, longitude);
    socket.emit("share location from client", { latitude, longitude });
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value;
  socket.emit("send msg from client", msg, checkBadWords);
});

socket.on("send msg from server", (msg) => {
  console.log(msg);
  const { messageText, createAt, username } = msg;
  let htmlContent = renderMessage.innerHTML;
  const messageElement = `
  <div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username}</p>
    <p class="message__date">${createAt}</p>
  </div>  
  <div class="message__row2">
    <p class="message__content">
      ${messageText}
    </p>
  </div>
</div>`;

  let contentRender = htmlContent + messageElement;
  renderMessage.innerHTML = contentRender;
  // cho ô input = empty
  input.value = "";
});

socket.on("share location from server", (linkLocation) => {
  const { messageText, createAt, username } = linkLocation;
  let htmlContent = renderMessage.innerHTML;
  const messageElement = `
  <div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username}</p>
    <p class="message__date">${createAt}</p>
  </div>  
  <div class="message__row2">
    <p class="message__content">
    <a href="${messageText}" target="_blank">Vị trí của ${username}</a>
    </p>
  </div>
</div>`;

  let contentRender = htmlContent + messageElement;
  renderMessage.innerHTML = contentRender;
});

// xử lý query string
const queryString = location.search;
const params = Qs.parse(queryString, {
  ignoreQueryPrefix: true,
});

const { username, room } = params;

renderNameRoom.innerHTML = room;

socket.emit("join room from client to server", { username, room });

// xử lý userList
socket.on("send userlist", (userList) => {
  let contenHtml = "";
  userList.map(
    (user) =>
      (contenHtml += `
      <li class="app__item-user">
      ${user.username}
      </li>
  `)
  );
  renderUserList.innerHTML = contenHtml;
});
