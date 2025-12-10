import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FaGoogle, FaApple, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import wave from "/wave.png";
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
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [roleAccess, setRoleAccess] = useState({});
  const [clientDashboardVisible, setClientDashboardVisible] = useState(false);
  const [bgImage, setBgImage] = useState(wave);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bgImages, setBgImages] = useState([wave]);

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
    const fetchBackgroundImage = async () => {
      try {
        const cachedImage = localStorage.getItem('VibeBg');
        const cachedTimestamp = localStorage.getItem('VibeBgTimestamp');
        const currentTime = new Date().getTime();
        const sixHours = 6 * 60 * 60 * 1000;

        if (cachedImage && cachedTimestamp && (currentTime - parseInt(cachedTimestamp)) < sixHours) {
          setBgImage(cachedImage);
          return;
        }

        const aks = await vibeBGImages();
        const resp = aks.data;
        console.log("API response:", resp);

        if (resp && resp.data && resp.data.length > 0) {
          const vibeBgImages = resp.data.filter(item => item.key === "VibeBg");
          console.log("Filtered VibeBg images:", vibeBgImages);
          
          if (vibeBgImages.length > 0) {
            const dayStartTime = new Date();
            dayStartTime.setHours(0, 0, 0, 0);
            const timeSinceDayStart = currentTime - dayStartTime.getTime();
            const sixHourInterval = Math.floor(timeSinceDayStart / sixHours);
            const imageIndex = sixHourInterval % vibeBgImages.length;
            
            const selectedImage = vibeBgImages[imageIndex];
            const newImageUrl = selectedImage.image;
            
            console.log(`Using image ${imageIndex + 1} of ${vibeBgImages.length} for 6-hour interval ${sixHourInterval}`);
            console.log("Selected image URL:", newImageUrl);
            
            setBgImage(newImageUrl);
            setBgImages(vibeBgImages.map(img => img.image));
            setCurrentImageIndex(imageIndex);
            
            localStorage.setItem('VibeBg', newImageUrl);
            localStorage.setItem('VibeBgTimestamp', currentTime.toString());
          } else {
            console.log("No VibeBg images found, using cached or default");
            if (cachedImage) {
              setBgImage(cachedImage);
            } else {
              setBgImage(wave);
            }
          }
        } else if (cachedImage) {
          setBgImage(cachedImage);
        } else {
          setBgImage(wave);
        }
      } catch (error) {
        console.error("Error fetching background image:", error);
        const cachedImage = localStorage.getItem('VibeBg');
        if (cachedImage) {
          setBgImage(cachedImage);
        } else {
          setBgImage(wave);
        }
      }
    };
    
    fetchBackgroundImage();
  }, []);

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Image Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>
        
        {/* Logo and Back Link */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <h1 className="text-2xl font-bold text-white jersey-15-regular tracking-wider">
            VIBE CONNECT
          </h1>
          <a 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm hover:bg-white/20 transition-all"
          >
            Back to website <FaArrowRight className="w-3 h-3" />
          </a>
        </div>
        
        {/* Tagline */}
        <div className="absolute bottom-12 left-6 right-6 z-10">
          <h2 className="text-3xl font-light text-white leading-tight mb-6">
            Capturing Moments,<br />
            Creating Memories
          </h2>
          
          {/* Pagination Dots */}
          <div className="flex gap-2">
            {bgImages.slice(0, 4).map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentImageIndex % 4
                    ? 'w-8 bg-white'
                    : 'w-4 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-[hsl(var(--login-dark))] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <h1 className="text-2xl font-bold text-white jersey-15-regular tracking-wider">
              VIBE CONNECT
            </h1>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-[hsl(var(--login-text))] mb-2">
              {page === "login" ? "Welcome Back" : "Single Sign-On"}
            </h2>
            <p className="text-[hsl(var(--login-text-muted))]">
              {page === "login" ? (
                <>Don't have an account? <span className="text-primary underline cursor-pointer">Sign up</span></>
              ) : (
                <span className="cursor-pointer hover:text-primary" onClick={() => setPage("login")}>Back to Login</span>
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                onChange={onChange}
                value={formData.email}
                className="w-full px-4 py-3.5 rounded-lg bg-[hsl(var(--login-input-bg))] border border-[hsl(var(--login-input-border))] text-[hsl(var(--login-text))] placeholder:text-[hsl(var(--login-text-muted))] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Password Field */}
            {page === "login" && (
              <div className="relative">
                <input
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  type={password ? "text" : "password"}
                  onChange={onChange}
                  value={formData.password}
                  className="w-full px-4 py-3.5 rounded-lg bg-[hsl(var(--login-input-bg))] border border-[hsl(var(--login-input-border))] text-[hsl(var(--login-text))] placeholder:text-[hsl(var(--login-text-muted))] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--login-text-muted))] hover:text-[hsl(var(--login-text))] transition-colors"
                >
                  {password ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                </button>
              </div>
            )}

            {/* Remember Me / Terms */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[hsl(var(--login-input-border))] bg-[hsl(var(--login-input-bg))] text-primary focus:ring-primary focus:ring-offset-0"
              />
              <label htmlFor="remember" className="text-sm text-[hsl(var(--login-text-muted))]">
                I agree to the <span className="text-primary underline cursor-pointer">Terms & Conditions</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/25"
            >
              {page === "login" ? "Login" : "Continue with SSO"}
            </button>

            {/* SSO Toggle */}
            {page === "login" && (
              <button
                type="button"
                onClick={() => setPage("sso")}
                className="w-full py-3.5 rounded-lg border border-[hsl(var(--login-input-border))] text-[hsl(var(--login-text))] font-medium hover:bg-[hsl(var(--login-input-bg))] transition-all"
              >
                SSO Login
              </button>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--login-input-border))]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[hsl(var(--login-dark))] text-[hsl(var(--login-text-muted))]">
                  Or login with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[hsl(var(--login-input-bg))] border border-[hsl(var(--login-input-border))] text-[hsl(var(--login-text))] font-medium hover:bg-[hsl(var(--login-dark-card))] transition-all"
              >
                <FaGoogle className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[hsl(var(--login-input-bg))] border border-[hsl(var(--login-input-border))] text-[hsl(var(--login-text))] font-medium hover:bg-[hsl(var(--login-dark-card))] transition-all"
              >
                <FaApple className="w-5 h-5" />
                Apple
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;