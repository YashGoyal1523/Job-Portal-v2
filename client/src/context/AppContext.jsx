import { createContext, useEffect, useState ,useRef} from "react";
import { jobsData } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react"; 

/**
 * App Context Provider
 * Global state management for the entire application
 * Manages: jobs, user data, company data, applications, search filters
 */
export const AppContext=createContext()

export const AppContextProvider= (props)=>{

    // Backend API URL from environment variables
    const backendUrl=import.meta.env.VITE_BACKEND_URL

    // Clerk authentication hooks
    const {user} = useUser() // Current logged-in user
    const { getToken } = useAuth(); // Function to get auth token

    // ============================================
    // STATE VARIABLES
    // ============================================
    
    // Job search filter state
    const [searchFilter,setSearchFilter]=useState({
        title:'', // Job title search term
        location:'' // Location search term
    })

    // Whether user has performed a search
    const [isSearched,setIsSearched]=useState(false)

    // Refs for search input fields
     const titleRef=useRef()
     const locationRef=useRef()
    
    // Controls visibility of recruiter login modal
    const [showRecruiterLogin,setShowRecruiterLogin] = useState(false )

    // Company/recruiter authentication state
    const [companyToken,setCompanyToken]=useState(null) // JWT token for company auth
    const [companyData,setCompanyData]=useState(null) // Company profile data

    // Loading state while checking for stored company token
    const [isLoadingToken, setIsLoadingToken] = useState(true);

    // User/job seeker state
    const [userData,setUserData]=useState(null) // Current user's profile data
    const [userApplications,setUserApplications] =useState([]) // User's job applications

    // Job listings state
    const [jobs,setJobs]=useState([]) // All available job postings

    // Company applicants state
    const [applicants,setApplicants]=useState(false) // Job applications for company
    


    // ============================================
    // API FETCH FUNCTIONS
    // ============================================
    
    /**
     * Fetch all available job postings
     * Used on home page to display job listings
     */
    const fetchJobs= async () =>{
        try{
            const {data} = await axios.get(backendUrl+'/api/jobs')
            if(data.success){
                setJobs(data.jobs)
            }
            else{
                toast.error(data.message)
            }
        }
        catch(e){
            toast.error(e.message)
        }
        
    }
    
    /**
     * Fetch company/recruiter profile data
     * Requires company authentication token
     */
    const fetchCompanyData=async()=>{
        try{
            const {data} = await axios.get(backendUrl+'/api/company/company',{headers:{token:companyToken}})
            if(data.success){
                setCompanyData(data.company)
            }
            else{
               
                toast.error(data.message)
            }
        }
        catch(e){
            toast.error(e.message)
        }
    }

    /**
     * Fetch authenticated user's profile data
     * Requires Clerk authentication token
     */
    const fetchUserData=async()=>{
        try{
            const token = await getToken()

            const {data} = await axios.get(backendUrl+'/api/users/user',{headers:{Authorization:`Bearer ${token}`}})
            if(data.success){
                setUserData(data.user)
            }
            else{
                toast.error(data.message)
            }
        }
        catch(e){
            toast.error(e.message)
        }
    }

    /**
     * Fetch all job applications submitted by the user
     * Requires Clerk authentication token
     */
    const fetchUserApplications = async ()=>{
        try{
            const token= await getToken()

            const {data}= await axios.get(backendUrl+'/api/users/applications',{headers:{Authorization:`Bearer ${token}`}})

            if(data.success){
                setUserApplications(data.applications)
            }
            else{
                toast.error(data.message)
            }
        }
        catch(e){
            toast.error(e.message)
        }
    }

    /**
     * Fetch all job applications for company's job postings
     * Requires company authentication token
     * Results are reversed to show newest applications first
     */
    const fetchCompanyJobApplications = async () =>{
        try{
            const {data} = await axios.get(backendUrl+'/api/company/applicants',{headers:{token:companyToken}})
           
            if(data.success){
                setApplicants(data.applications.reverse()) // Reverse to show newest first
            }
            else{
                toast.error(data.message)
            }
        }
        catch(e){
            toast.error(e.message)
        }
    }


    // ============================================
    // USE EFFECT HOOKS
    // ============================================
    
    // On component mount: fetch jobs and check for stored company token
    useEffect(()=>{
        fetchJobs()

        // Check localStorage for saved company token
        const storedCompanyToken=localStorage.getItem('companyToken')
        if(storedCompanyToken){
            setCompanyToken(storedCompanyToken)
        }
        setIsLoadingToken(false); // Mark token loading as complete
    },[])

    // When company token changes: fetch company data
    useEffect(()=>{
        if(companyToken){
          fetchCompanyData()  
        }
    },[companyToken])

    // When user logs in: fetch user data and applications
    useEffect(()=>{
        if(user){
            fetchUserData()
            fetchUserApplications()
        }
    },[user])
    
    // When company token changes: fetch company's job applications
    useEffect(()=>{
        if(companyToken){
            fetchCompanyJobApplications()
        }
    },[companyToken])
    



    const value={
        searchFilter,setSearchFilter,
        isSearched,setIsSearched,
        jobs,setJobs,
        titleRef,locationRef,
        showRecruiterLogin,setShowRecruiterLogin,
        companyData,setCompanyData,companyToken,setCompanyToken,
        backendUrl,isLoadingToken,
        fetchJobs,
        fetchUserData,
        userData,userApplications,setUserData,setUserApplications,
        fetchUserApplications,
        fetchCompanyJobApplications,applicants,setApplicants
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}