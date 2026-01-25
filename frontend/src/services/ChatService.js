import axios from "axios";
import auth from "../config/firebase";
import { io } from "socket.io-client";

const baseURL = "http://localhost:5000/api";

const getUserToken = async () => {
  const user = auth.currentUser;
  const token = user && (await user.getIdToken());
  return token;
};

export const initiateSocketConnection = async () => {
  const token = await getUserToken();

  const socket = io("http://localhost:5000", {
    auth: {
      token,
    },
  });

  return socket;
};

const createHeader = async () => {
  const token = await getUserToken();

  const payloadHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return payloadHeader;
};

export const getAllUsers = async () => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${baseURL}/user`, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getUser = async (userId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${baseURL}/user/${userId}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getUsers = async (users) => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${baseURL}/user/users`, users, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getChatRooms = async (userId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${baseURL}/room/${userId}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getChatRoomOfUsers = async (firstUserId, secondUserId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(
      `${baseURL}/room/${firstUserId}/${secondUserId}`,
      header
    );
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const createChatRoom = async (members) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${baseURL}/room`, members, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getMessagesOfChatRoom = async (chatRoomId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${baseURL}/message/${chatRoomId}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const sendMessage = async (messageBody) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${baseURL}/message`, messageBody, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const setUsername = async (username) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${baseURL}/user/username`, { username }, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// Group Management APIs
export const createGroup = async (groupData) => {
  const header = await createHeader();
  try {
    const res = await axios.post(`${baseURL}/group`, groupData, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getUserGroups = async () => {
  const header = await createHeader();
  try {
    const res = await axios.get(`${baseURL}/group`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getGroup = async (groupId) => {
  const header = await createHeader();
  try {
    const res = await axios.get(`${baseURL}/group/${groupId}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const updateGroup = async (groupId, groupData) => {
  const header = await createHeader();
  try {
    const res = await axios.put(`${baseURL}/group/${groupId}`, groupData, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const addGroupMembers = async (groupId, memberIds) => {
  const header = await createHeader();
  try {
    const res = await axios.post(`${baseURL}/group/${groupId}/members`, { memberIds }, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const removeGroupMember = async (groupId, memberId) => {
  const header = await createHeader();
  try {
    const res = await axios.delete(`${baseURL}/group/${groupId}/members/${memberId}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const leaveGroup = async (groupId) => {
  const header = await createHeader();
  try {
    const res = await axios.post(`${baseURL}/group/${groupId}/leave`, {}, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const deleteGroup = async (groupId) => {
  const header = await createHeader();
  try {
    const res = await axios.delete(`${baseURL}/group/${groupId}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const updateGroupNotifications = async (groupId, notifications) => {
  const header = await createHeader();
  try {
    const res = await axios.put(`${baseURL}/group/${groupId}/notifications`, { notifications }, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
