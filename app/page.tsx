"use client"

import { useState, useRef, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Film, Mic, Search, Clock, Home, Library, X, Share2, Plus, Star, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface MovieResult {
  id: number
  title: string
  year: string
  director: string
  cast: string[]
  synopsis: string
  rating: number
  runtime: string
  genres: string[]
  poster: string
}

export default function MovieIdentificationApp() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [showIntro, setShowIntro] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [showResults, setShowResults] = useState(false)
  const [currentResult, setCurrentResult] = useState<MovieResult | null>(null)

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }

    if (activeTab === "home") {
      initCamera()
    }

    // Hide intro after 2 seconds
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 2000)

    return () => {
      // Clean up camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      clearTimeout(timer)
    }
  }, [activeTab])

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageUrl = canvas.toDataURL("image/jpeg")
        setCapturedImages((prev) => [...prev, imageUrl])
      }
    }
  }

  const startAudioRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(audioStream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start()
    } catch (error) {
      console.error("Error starting audio recording:", error)
    }
  }

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()

      // Clean up audio stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }

      // Show results after a short delay to simulate processing
      setTimeout(() => {
        // Mock result data - in a real app, this would come from an API
        setCurrentResult({
          id: 4,
          title: "Interstellar",
          year: "2014",
          director: "Christopher Nolan",
          cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
          synopsis:
            "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
          rating: 8.6,
          runtime: "2h 49m",
          genres: ["Adventure", "Drama", "Sci-Fi"],
          poster: "/interstellar-movie-poster.png",
        })
        setShowResults(true)
      }, 1000)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setCapturedImages([])
    setCountdown(10)

    // Start audio recording
    await startAudioRecording()

    // Set up image capture intervals
    const captureInterval = Math.floor(10000 / 3) // 3 images over 10 seconds

    // Schedule image captures
    setTimeout(() => captureImage(), captureInterval)
    setTimeout(() => captureImage(), captureInterval * 2)
    setTimeout(() => captureImage(), captureInterval * 3 - 100) // Slightly before end

    // Set up countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsAnalyzing(false)
          stopAudioRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const closeResults = () => {
    setShowResults(false)
    setCurrentResult(null)
  }

  const addToLibrary = () => {
    // In a real app, this would save to a database
    closeResults()
    // Show a success message or navigate to library
    setActiveTab("library")
  }

  // Mock history data
  const historyItems = [
    {
      id: 1,
      title: "Inception",
      director: "Christopher Nolan",
      year: "2010",
      image: "/inception-movie-poster.png",
      date: "Yesterday",
    },
    {
      id: 2,
      title: "The Shawshank Redemption",
      director: "Frank Darabont",
      year: "1994",
      image: "/shawshank-redemption-poster.png",
      date: "Last week",
    },
    {
      id: 3,
      title: "Pulp Fiction",
      director: "Quentin Tarantino",
      year: "1994",
      image: "/pulp-fiction-poster.png",
      date: "2 weeks ago",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] text-[#1d1d1f] font-sans">
      {/* Apple-style navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <nav className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Film className="h-5 w-5" />
            <span className="text-sm font-medium">RollCredits</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-500 hover:text-gray-800">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Intro animation */}
        <AnimatePresence>
          {showIntro && (
            <motion.div
              className="absolute inset-0 bg-white z-40 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <Film className="h-16 w-16 text-black mb-4" />
                <h1 className="text-2xl font-semibold tracking-tight">RollCredits</h1>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex w-full max-w-xs mx-auto mb-8 bg-gray-100 rounded-full p-1"
          >
            <button
              onClick={() => setActiveTab("home")}
              className={cn(
                "flex items-center justify-center gap-1.5 flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "home" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={cn(
                "flex items-center justify-center gap-1.5 flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "library" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Library className="w-4 h-4" />
              <span>Library</span>
            </button>
          </motion.div>

          {/* Home Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {/* Title Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-4xl font-semibold tracking-tight mb-2">Identify Movies</h1>
                  <p className="text-gray-500 text-lg">Point your camera at the screen</p>
                </motion.div>

                {/* Camera View */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full mb-8 relative"
                >
                  <div
                    className={cn(
                      "relative w-full aspect-video overflow-hidden rounded-3xl",
                      "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
                      isAnalyzing ? "ring-2 ring-blue-500" : "",
                    )}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Hidden canvas for image capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Recording indicators */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-between p-6"
                        >
                          <div className="w-full flex justify-between items-center">
                            <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md"
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-sm font-medium">Recording</span>
                            </motion.div>

                            <motion.div
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md"
                            >
                              <span className="text-xl font-semibold">{countdown}s</span>
                            </motion.div>
                          </div>

                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full"
                          >
                            <Progress value={(10 - countdown) * 10} className="h-1.5" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Pulsing animation when analyzing */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 0.2, 0.7],
                              }}
                              transition={{
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 2,
                                ease: "easeInOut",
                              }}
                              className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 blur-md"
                            />
                            <motion.div
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0.2, 0.5],
                              }}
                              transition={{
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 3,
                                ease: "easeInOut",
                                delay: 0.3,
                              }}
                              className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 blur-md"
                            />
                            <div className="relative w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                              <Film className="w-7 h-7 text-blue-500" />
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Captured Images Preview (small thumbnails) */}
                <AnimatePresence>
                  {capturedImages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex gap-2 mb-8"
                    >
                      {capturedImages.map((img, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="w-16 h-16 rounded-xl overflow-hidden shadow-md"
                        >
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Captured ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={cn("relative group", "disabled:opacity-50 disabled:cursor-not-allowed")}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-br from-blue-400 to-blue-600",
                        "group-hover:opacity-90 transition-opacity",
                        "blur-md opacity-70 group-hover:blur-xl",
                        "scale-[0.85] group-hover:scale-[0.9] transition-all duration-300",
                      )}
                    />
                    <div
                      className={cn(
                        "relative flex items-center justify-center",
                        "w-20 h-20 rounded-full",
                        "bg-gradient-to-br from-blue-400 to-blue-600",
                        "text-white shadow-lg",
                        "transition-all duration-300",
                        isAnalyzing ? "scale-90" : "scale-100 group-hover:scale-105",
                      )}
                    >
                      <div className="flex flex-col items-center">
                        {isAnalyzing ? <Mic className="w-6 h-6 mb-1" /> : <Film className="w-6 h-6 mb-1" />}
                        <span className="text-xs font-medium">{isAnalyzing ? "Listening" : "Identify"}</span>
                      </div>
                    </div>
                  </button>
                </motion.div>

                {/* Instructions */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-gray-500 text-sm mt-8 text-center"
                >
                  Tap to identify the movie playing on screen
                </motion.p>
              </motion.div>
            )}

            {/* Library Tab Content */}
            {activeTab === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-4xl font-semibold tracking-tight mb-2">Your Library</h1>
                  <p className="text-gray-500 text-lg">Previously identified movies</p>
                </motion.div>

                <div className="space-y-4">
                  {historyItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-center p-4">
                        <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-gray-500 text-sm">
                            {item.director} • {item.year}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{item.date}</span>
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {historyItems.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Library className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No movies yet</h3>
                    <p className="text-gray-500 text-sm">Movies you identify will appear here</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Screen */}
        <AnimatePresence>
          {showResults && currentResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Close button */}
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={closeResults}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-gray-700 hover:bg-black/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Movie poster */}
                <div className="w-full h-64 bg-gray-100 relative">
                  <img
                    src="/interstellar-movie-poster.png"
                    alt="Interstellar movie poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
                </div>

                {/* Scrollable content area */}
                <div className="overflow-y-auto flex-1 overscroll-contain">
                  <div className="px-6 py-6">
                    {/* Title and metadata */}
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">{currentResult.title}</h2>

                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                      <span>{currentResult.year}</span>
                      <span>•</span>
                      <span>{currentResult.runtime}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span>{currentResult.rating}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-4">
                      <button className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                        <Play className="w-4 h-4" />
                        <span>Watch Trailer</span>
                      </button>

                      <button className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                        <Star className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mt-6">
                      {currentResult.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Synopsis */}
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Synopsis</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{currentResult.synopsis}</p>
                    </div>

                    {/* Director & Cast */}
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Director</h3>
                      <p className="text-sm text-gray-700">{currentResult.director}</p>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Cast</h3>
                      <p className="text-sm text-gray-700">{currentResult.cast.join(", ")}</p>
                    </div>

                    {/* Extended content */}
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Awards & Recognition</h3>
                      <p className="text-sm text-gray-700">
                        Winner of the Academy Award for Best Visual Effects. Nominated for Best Original Score, Best
                        Sound Mixing, Best Sound Editing, and Best Production Design.
                      </p>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Critical Reception</h3>
                      <p className="text-sm text-gray-700">
                        Interstellar received positive reviews for its visual effects, musical score, acting, and
                        ambition. Some critics had mixed feelings about the scientific accuracy, pacing, and plot.
                      </p>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Production</h3>
                      <p className="text-sm text-gray-700">
                        The film had a production budget of $165 million and was shot using a combination of 35mm film
                        and IMAX cameras. Christopher Nolan emphasized practical effects and built full-sized sets for
                        many scenes.
                      </p>
                    </div>

                    {/* Where to watch */}
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Where to Watch</h3>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                          <div className="w-5 h-5 bg-red-600 rounded"></div>
                          <span className="text-xs font-medium">Netflix</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                          <div className="w-5 h-5 bg-green-600 rounded"></div>
                          <span className="text-xs font-medium">Hulu</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                          <div className="w-5 h-5 bg-blue-600 rounded"></div>
                          <span className="text-xs font-medium">Prime Video</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons - sticky footer */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-3">
                    <button
                      onClick={closeResults}
                      className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addToLibrary}
                      className="flex-1 py-3 rounded-full bg-blue-500 text-white font-medium text-sm flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add to Library
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
