

let config = {
  baseUrl:'http://localhost:8000/api',
  colors: {
    primary: "#006033",
  },
  token: "",
  height:'80vh',
  primevue: {},
  getMembersRoute: "/memo/members",
  getBootRoute:"/memo/boot",
  getDepartmentsRoute: "/memo/departments",
  getStatusesRoute: "/memo/statuses",
  getTypesRoute: "/memo/types",
  getMemosRoute: "/memo/all",
  memosRoute: "/memo",
  approveMemoRoute: "/memo/approve",
  rejectMemoRoute: "/memo/reject",
  makeCommentRoute:"/memo/make_comment"
};



export const setConfig = (options) => {
  config = { ...config, ...options };
};

export const getConfig = () => config;
