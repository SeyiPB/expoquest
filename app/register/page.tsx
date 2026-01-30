"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowRight, ArrowLeft, User, Briefcase, Sparkles, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Modal } from "@/components/ui/modal"

const STEPS = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "About You", icon: Briefcase },
    { id: 3, title: "Tech Profile", icon: Sparkles },
]

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    const [currentStep, setCurrentStep] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showMediaModal, setShowMediaModal] = useState(false)

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        zip_code: "",
        age_range: "",
        attendee_type: [] as string[],
        organization: "",
        interests: [] as string[],
        tech_access: "",
        digital_skill_level: "",
        reason_for_attending: "",
        opt_in_communications: false,
        agreed_to_media_release: false,
        confidence_tech_access_pre: "",
        clarity_tech_pathways_pre: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleMultiSelect = (field: "attendee_type" | "interests", value: string) => {
        setFormData(prev => {
            const current = prev[field]
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) }
            } else {
                return { ...prev, [field]: [...current, value] }
            }
        })
    }

    const validateStep = (step: number): boolean => {
        setError(null)
        switch (step) {
            case 1:
                if (!formData.first_name || !formData.last_name || !formData.email || !formData.zip_code) {
                    setError("Please fill in all required fields.")
                    return false
                }
                if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                    setError("Please enter a valid email address.")
                    return false
                }
                return true
            case 2:
                if (!formData.age_range || formData.attendee_type.length === 0) {
                    setError("Please select your age range and at least one attendee type.")
                    return false
                }
                return true
            case 3:
                if (!formData.tech_access || !formData.digital_skill_level || !formData.confidence_tech_access_pre || !formData.clarity_tech_pathways_pre) {
                    setError("Please fill in all required fields.")
                    return false
                }
                if (!formData.agreed_to_media_release) {
                    setError("You must agree to the Media Release & Photography Notice to continue.")
                    return false
                }
                return true
            default:
                return true
        }
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3))
        }
    }

    const prevStep = () => {
        setError(null)
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async () => {
        if (!validateStep(3)) return

        setSubmitting(true)
        setError(null)

        try {
            let eventId: string | null = null
            const { data: events } = await supabase.from("events").select("id").limit(1)
            if (events && events.length > 0) {
                eventId = events[0].id
            } else {
                const { data: newEvent, error: eventError } = await supabase
                    .from("events")
                    .insert({ name: "Queens NY Expo 2026" })
                    .select()
                    .single()
                if (eventError) throw eventError
                eventId = newEvent.id
            }

            const { data, error: insertError } = await supabase
                .from("attendees")
                .insert({
                    event_id: eventId,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    zip_code: formData.zip_code,
                    age_range: formData.age_range,
                    attendee_type: formData.attendee_type,
                    organization: formData.organization,
                    interests: formData.interests,
                    tech_access: formData.tech_access,
                    digital_skill_level: formData.digital_skill_level,
                    reason_for_attending: formData.reason_for_attending || null,
                    opt_in_communications: formData.opt_in_communications,
                    confidence_tech_access_pre: formData.confidence_tech_access_pre
                        ? parseInt(formData.confidence_tech_access_pre)
                        : null,
                    clarity_tech_pathways_pre: formData.clarity_tech_pathways_pre
                        ? parseInt(formData.clarity_tech_pathways_pre)
                        : null
                })
                .select()
                .single()

            if (insertError) throw insertError

            localStorage.setItem("expo_attendee_id", data.id)
            localStorage.setItem("expo_attendee_name", data.first_name)

            router.push("/dashboard")
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Something went wrong.")
        } finally {
            setSubmitting(false)
        }
    }

    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
    }

    return (
        <div className="min-h-screen text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url("/assets/queens.jpg")' }}
                />
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
            </div>

            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                        Queens Expo
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">Complete your registration</p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-8 px-0 sm:px-4">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep > step.id
                                        ? "bg-neon-green border-neon-green text-black"
                                        : currentStep === step.id
                                            ? "bg-neon-blue/20 border-neon-blue text-neon-blue"
                                            : "bg-gray-800 border-gray-600 text-gray-500"
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                    ) : (
                                        <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </div>
                                <span
                                    className={`text-[10px] sm:text-xs mt-2 font-medium text-center ${currentStep >= step.id ? "text-white" : "text-gray-500"
                                        }`}
                                >
                                    {step.title}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-1 sm:mx-2 -mt-7 sm:-mt-6 transition-all duration-300 ${currentStep > step.id ? "bg-neon-green" : "bg-gray-700"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="glass-card p-6 sm:p-8 neon-border-blue relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Sparkles className="w-24 h-24" />
                    </div>
                    <AnimatePresence mode="wait" custom={currentStep}>
                        <motion.div
                            key={currentStep}
                            custom={currentStep}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name *</Label>
                                            <Input
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                placeholder="Jane"
                                                className="bg-white/5 border-white/20 focus:border-neon-blue"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name *</Label>
                                            <Input
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                placeholder="Doe"
                                                className="bg-white/5 border-white/20 focus:border-neon-blue"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="jane@example.com"
                                            className="bg-white/5 border-white/20 focus:border-neon-blue"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zip_code">Zip Code *</Label>
                                        <Input
                                            id="zip_code"
                                            name="zip_code"
                                            value={formData.zip_code}
                                            onChange={handleChange}
                                            placeholder="11375"
                                            className="bg-white/5 border-white/20 focus:border-neon-blue"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: About You */}
                            {currentStep === 2 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-bold mb-4">About You</h2>
                                    <div className="space-y-2">
                                        <Label htmlFor="age_range">Age Range *</Label>
                                        <select
                                            id="age_range"
                                            name="age_range"
                                            value={formData.age_range}
                                            onChange={handleChange}
                                            className="w-full h-10 rounded-md border border-white/20 bg-white/5 px-3 text-sm focus:border-neon-blue focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Under 18">Under 18</option>
                                            <option value="18-24">18-24</option>
                                            <option value="25-34">25-34</option>
                                            <option value="35-44">35-44</option>
                                            <option value="45+">45+</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>I am a... (Select all that apply) *</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Student", "Job Seeker", "Professional", "Entrepreneur", "Educator"].map(
                                                type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleMultiSelect("attendee_type", type)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${formData.attendee_type.includes(type)
                                                            ? "bg-neon-purple text-white border-neon-purple shadow-lg shadow-neon-purple/30"
                                                            : "bg-white/5 hover:bg-white/10 border-white/20"
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Primary Interests</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {["AI", "Gaming", "Cybersecurity", "Coding", "Entrepreneurship", "Career Pathways", "Mentorship"].map(
                                                item => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => handleMultiSelect("interests", item)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${formData.interests.includes(item)
                                                            ? "bg-neon-blue text-black border-neon-blue shadow-lg shadow-neon-blue/30"
                                                            : "bg-white/5 hover:bg-white/10 border-white/20"
                                                            }`}
                                                    >
                                                        {item}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="organization">School or Organization (Optional)</Label>
                                        <Input
                                            id="organization"
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            placeholder="Queens College, TechStart..."
                                            className="bg-white/5 border-white/20 focus:border-neon-blue"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Tech Profile */}
                            {currentStep === 3 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-bold mb-4">Tech Profile & Quick Check-in</h2>
                                    <div className="space-y-2">
                                        <Label htmlFor="tech_access">Access to Technology *</Label>
                                        <select
                                            id="tech_access"
                                            name="tech_access"
                                            value={formData.tech_access}
                                            onChange={handleChange}
                                            className="w-full h-10 rounded-md border border-white/20 bg-white/5 px-3 text-sm focus:border-neon-blue focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Laptop/Desktop">Laptop/Desktop</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Smartphone only">Smartphone only</option>
                                            <option value="Limited/No access">Limited/No access</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="digital_skill_level">Digital Skill Level *</Label>
                                        <select
                                            id="digital_skill_level"
                                            name="digital_skill_level"
                                            value={formData.digital_skill_level}
                                            onChange={handleChange}
                                            className="w-full h-10 rounded-md border border-white/20 bg-white/5 px-3 text-sm focus:border-neon-blue focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                    <div className="p-4 rounded-xl bg-neon-purple/10 border border-neon-purple/30 space-y-4">
                                        <p className="text-sm text-neon-purple font-semibold">Quick Check-in</p>
                                        <div className="space-y-2">
                                            <Label htmlFor="confidence_tech_access_pre">
                                                Confidence in accessing tech career opportunities? (1-5) *
                                            </Label>
                                            <Input
                                                id="confidence_tech_access_pre"
                                                name="confidence_tech_access_pre"
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={formData.confidence_tech_access_pre}
                                                onChange={handleChange}
                                                className="bg-white/5 border-white/20 focus:border-neon-purple"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="clarity_tech_pathways_pre">
                                                Clarity on pathways into tech careers? (1-5) *
                                            </Label>
                                            <Input
                                                id="clarity_tech_pathways_pre"
                                                name="clarity_tech_pathways_pre"
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={formData.clarity_tech_pathways_pre}
                                                onChange={handleChange}
                                                className="bg-white/5 border-white/20 focus:border-neon-purple"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="opt_in"
                                            checked={formData.opt_in_communications}
                                            onCheckedChange={(checked: boolean) =>
                                                setFormData(prev => ({ ...prev, opt_in_communications: checked }))
                                            }
                                        />
                                        <Label htmlFor="opt_in" className="text-sm text-muted-foreground">
                                            I'd like to receive info about future opportunities.
                                        </Label>
                                    </div>
                                    <div className="flex items-start space-x-2 pt-2">
                                        <Checkbox
                                            id="agreed_to_media_release"
                                            checked={formData.agreed_to_media_release}
                                            onCheckedChange={(checked: boolean) =>
                                                setFormData(prev => ({ ...prev, agreed_to_media_release: checked }))
                                            }
                                            required
                                        />
                                        <Label htmlFor="agreed_to_media_release" className="text-sm text-muted-foreground leading-tight">
                                            I agree to the{" "}
                                            <button
                                                type="button"
                                                onClick={() => setShowMediaModal(true)}
                                                className="text-neon-blue hover:underline font-semibold"
                                            >
                                                Media Release &amp; Photography Notice
                                            </button>
                                            *
                                        </Label>
                                    </div>
                                </div>
                            )}

                            <Modal
                                isOpen={showMediaModal}
                                onClose={() => setShowMediaModal(false)}
                                title="Media Release & Photography Notice"
                            >
                                <div className="space-y-4 text-sm text-gray-300">
                                    <p>
                                        By entering the Queens Tech &amp; Career Expo, you acknowledge and agree that you may be photographed, filmed, or recorded.
                                    </p>
                                    <p>
                                        These images and recordings may be used by the Queens Borough President's Office, event partners, and authorized media for promotional, marketing, educational, and documentation purposes across print, digital, social media, and broadcast platforms, without compensation.
                                    </p>
                                    <p>
                                        Your presence at the event constitutes your consent to such use.
                                    </p>
                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, agreed_to_media_release: true }));
                                                setShowMediaModal(false);
                                            }}
                                            className="bg-neon-blue text-black font-semibold hover:bg-neon-blue/90"
                                        >
                                            I Agree
                                        </Button>
                                    </div>
                                </div>
                            </Modal>
                        </motion.div>
                    </AnimatePresence>

                    {/* Error Message */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm mt-4 text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`${currentStep === 1 ? "invisible" : ""} border-white/20 hover:bg-white/10`}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 text-white font-semibold"
                            >
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-gradient-to-r from-neon-green to-emerald-500 hover:opacity-90 text-black font-bold px-8"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
