import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import loginCityscape from "@/assets/login-cityscape.jpg";
import {
  getEmployeeAssociatedSites,
  getHRMSEmployeeID,
  login,
  getAdminAccess,
  vibeBGImages,
} from "../../api";
import { setItemInLocalStorage, getItemInLocalStorage } from "../../utils/localStorage";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [password, showPassword] = useState(false);
  const [page, setPage] = useState("login");
  const [rememberMe, setRememberMe] = useState(false);

  const [roleAccess, setRoleAccess] = useState({});
  const [clientDashboardVisible, setClientDashboardVisible] = useState(false);
  const [bgImage, setBgImage] = useState(loginCityscape);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bgImages, setBgImages] = useState([loginCityscape]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const approverId = localStorage.getItem("APPROVERID");
    const hrmsOrgId = localStorage.getItem("HRMSORGID");
    if (token && approverId && hrmsOrgId) {
      const fetchRoleAccess = async () => {
        try {
          const res = await getAdminAccess(hrmsOrgId, approverId);
          if (res && res.length > 0) {
            const clientDashboardAccess =
              res[0].client_dashboard === true || res[0].client_dashboard === "true";
            if (clientDashboardAccess) {
              navigate("/admin/hrms/client-dashboard");
            } else {
              navigate("/dashboard");
            }
          } else {
            navigate("/dashboard");
          }
          toast.success("You are already logged in!");
        } catch (error) {
          console.error("Error fetching admin access:", error);
          navigate("/dashboard");
        }
      };
      fetchRoleAccess();
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const response = await login({
        user: {
          email: formData.email,
          password: formData.password,
        },
      });

      console.log("response data:", response.data);
      const selectedSiteId = response.data.user.selected_site_id;
      const userNameFromResponse = response.data.user.firstname;
      const userEmail = response.data?.user?.email;
      const siteName = response.data?.site?.name;
      const mobileNumber = response.data?.user?.mobile;
      setItemInLocalStorage("SITENAME", siteName);
      setItemInLocalStorage("USEREMAIL", userEmail);
      setItemInLocalStorage("SITEID", selectedSiteId);
      setItemInLocalStorage("Name", userNameFromResponse);
      setItemInLocalStorage("Mobile", mobileNumber);
      const features = response.data.features;
      setItemInLocalStorage("FEATURES", features);

      const featNames = features.map((feature) => feature.feature_name);

      if (featNames.includes("hrms") && response.data.user.organization_id) {
        try {
          const hrmsRes = await getHRMSEmployeeID(response.data.user.id);
          const siteRes = await getEmployeeAssociatedSites(hrmsRes.id);
          const associatedSiteID = siteRes[0].associated_organization;
          setItemInLocalStorage("HRMS_SITE_ID", associatedSiteID);
          setItemInLocalStorage("HRMS_EMPLOYEE_ID", hrmsRes.id);
          setItemInLocalStorage("APPROVERID", hrmsRes.id);
          setItemInLocalStorage("HRMSORGID", hrmsRes.organization);
        } catch (error) {
          console.error("Error getting employee ID:", error);
        }
      }

      const loginD = response.data.user;
      setItemInLocalStorage("user", loginD);
      setItemInLocalStorage("UserId", response.data.user.id);
      setItemInLocalStorage("UNITID", response.data.user.unit_id);
      setItemInLocalStorage("Building", response.data.buildings);
      setItemInLocalStorage("categories", response.data.categories);
      const token = response.data.user.api_key;
      setItemInLocalStorage("TOKEN", token);
      setItemInLocalStorage("LASTNAME", response.data.user.lastname);
      const userType = response.data.user.user_type;
      setItemInLocalStorage("USERTYPE", userType);
      setItemInLocalStorage("EMAIL", response?.data?.user?.email)
      setItemInLocalStorage("MOBILE", response?.data?.user?.mobile)
      setItemInLocalStorage("COMPANYID", response.data.user.company_id);
      setItemInLocalStorage("STATUS", response.data.statuses);
      setItemInLocalStorage("complaint", response.data.complanits);

      toast.loading("Processing your data please wait...");

      const approverId = getItemInLocalStorage("APPROVERID");
      const hrmsOrgId = getItemInLocalStorage("HRMSORGID");
      if (hrmsOrgId && approverId) {
        try {
          const accessRes = await getAdminAccess(hrmsOrgId, approverId);
          if (accessRes && accessRes.length > 0) {
            const clientDashboardAccess =
              accessRes[0].client_dashboard === true || accessRes[0].client_dashboard === "true";
            setRoleAccess(accessRes[0]);
            setClientDashboardVisible(clientDashboardAccess);
            localStorage.setItem('CLIENT_DASHBOARD_VISIBLE', clientDashboardAccess);
            
            console.log("Client Dashboard Visibility:", clientDashboardAccess);
            if (clientDashboardAccess) {
              toast.dismiss();
              navigate("/admin/hrms/client-dashboard");
              window.location.reload();
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching admin access:", error);
        }
      }

      if (userType === "pms_admin") {
        navigate("/dashboard");
      } else if (userType === "auditor") {
        navigate("/dashboard");
      } else if (userType === "vendor") {
        navigate("/compliance/vendor/dashboard");
      } else {
        navigate(
          selectedSiteId === 10
            ? "/employee/dashboard"
            : response.data.user.organization_id
            ? "/employee-portal/attendance"
            : "/mytickets"
        );
      }
      toast.dismiss();
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const togglePassword = () => {
    showPassword(!password);
  };

  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        const aks = await vibeBGImages();
        const resp = aks.data;
        console.log("API response:", resp);

        if (resp && resp.data && resp.data.length > 0) {
          const vibeBgImages = resp.data.filter(item => item.key === "VibeBg");
          console.log("Filtered VibeBg images:", vibeBgImages);
          
          if (vibeBgImages.length > 0) {
            const imageUrls = vibeBgImages.map(img => img.image);
            setBgImages(imageUrls);
            setBgImage(imageUrls[0]);
            setCurrentImageIndex(0);
            console.log(`Loaded ${imageUrls.length} images for slideshow`);
          } else {
            console.log("No VibeBg images found, using default");
            setBgImages([loginCityscape]);
            setBgImage(loginCityscape);
          }
        } else {
          setBgImages([loginCityscape]);
          setBgImage(loginCityscape);
        }
      } catch (error) {
        console.error("Error fetching background images:", error);
        setBgImages([loginCityscape]);
        setBgImage(loginCityscape);
      }
    };
    
    fetchBackgroundImages();
  }, []);

  // Slideshow effect - change image every 5 seconds
  useEffect(() => {
    if (bgImages.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bgImages.length;
        setBgImage(bgImages[nextIndex]);
        return nextIndex;
      });
      
      setTimeout(() => setIsTransitioning(false), 700);
    }, 5000);

    return () => clearInterval(interval);
  }, [bgImages]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Side - Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 sm:mb-12">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary flex items-center justify-center">
            <FaHome className="text-primary-foreground text-lg sm:text-xl" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-foreground">VibeCopilot</span>
        </div>

        {/* Form Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Let's login to grab amazing deal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 max-w-md">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              onChange={onChange}
              value={formData.email}
              className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>

          {/* Password Field */}
          {page === "login" && (
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  type={password ? "text" : "password"}
                  onChange={onChange}
                  value={formData.password}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {password ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>
            <button 
              type="button" 
              className="text-sm text-primary hover:text-primary-dark transition-colors text-left sm:text-right"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 sm:py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/25 text-sm sm:text-base"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setPage(page === "login" ? "sso" : "login")}
              className="flex-1 py-3 sm:py-3.5 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-all text-sm sm:text-base"
            >
              SSO
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <span className="text-primary font-semibold cursor-pointer hover:underline">
                Sign Up
              </span>
            </p>
          </div>
        </form>
      </div>

      {/* Right Side - Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-4 xl:p-6">
        <div className="relative w-full h-full rounded-2xl xl:rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${isTransitioning ? 'opacity-90 scale-105' : 'opacity-100 scale-100'}`}
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary/60" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-6 xl:p-10">
            {/* Top Text */}
            <div className="text-center pt-6 xl:pt-10">
              <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-medium text-white leading-relaxed drop-shadow-lg">
                Browse thousands of properties to buy, sell,<br className="hidden xl:block" />
                or rent with trusted agents.
              </h2>
            </div>
            
            {/* Pagination Dots */}
            {bgImages.length > 1 && (
              <div className="flex justify-center gap-2 pb-6">
                {bgImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setBgImage(bgImages[index]);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;