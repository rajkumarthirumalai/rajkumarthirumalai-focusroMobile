import apiClient from './apiClient';



const updateHoursApi =(orgCode,token,version) =>

apiClient.get(`${orgCode}/sys-app/update-last-activity?version=${version}` ,{

headers:{Authorization:`Bearer ${token}`,

}

})



export default updateHoursApi;