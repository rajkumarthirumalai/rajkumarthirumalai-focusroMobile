import apiClient from './apiClient';



const activeHoursApi =(orgCode,token,version) =>

apiClient.get(`${orgCode}/sys-app/user/active-time?version=${version}` ,{

headers:{Authorization:`Bearer ${token}`,

}

})



export default activeHoursApi;