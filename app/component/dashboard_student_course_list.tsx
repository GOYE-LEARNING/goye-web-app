"use client";
import { useState, useEffect, useRef } from "react";
import { GoVideo } from "react-icons/go";
import { AnimatePresence, motion } from "framer-motion";
import { MdChevronRight } from "react-icons/md";
import SubHeader from "./dashboard_subheader";
import Loader from "./loader";
import { useProgress } from "../context/progressContext";

interface Lesson {
  id: string;
  lesson_title: string;
  lesson_video: string;
  duration?: number;
}

interface Module {
  id: string;
  module_title: string;
  module_description: string;
  module_duration: string;
  lesson?: Lesson[];
}

interface Props {
  courseId: string;
  backFunction: () => void;
  course_title: string;
}

interface VideoTrackingData {
  id: string;
  videoTrackTime: number;
  videoFinished: boolean;
  basedTimeTracking: string;
  lessonId: string;
}

export default function DashboardStudentCourseList({
  courseId,
  backFunction,
  course_title,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  // Store video tracker IDs for each lesson
  const [videoTrackerIds, setVideoTrackerIds] = useState<Map<string, string>>(new Map());
  // Store last saved time to avoid too many API calls
  const [lastSavedTime, setLastSavedTime] = useState<Map<string, number>>(new Map());
  // Track if video has been finished
  const [finishedLessons, setFinishedLessons] = useState<Set<string>>(new Set());
  // Store progress for each lesson
  const [lessonProgress, setLessonProgress] = useState<Map<string, number>>(new Map());
  // Loading state for lesson selection
  const [loadingLesson, setLoadingLesson] = useState<boolean>(false);
  // Store video duration for each lesson
  const [videoDurations, setVideoDurations] = useState<Map<string, number>>(new Map());

  // Use refs to avoid timing issues with state updates
  const pendingSeekTime = useRef<number | null>(null);
  const hasRestoredRef = useRef<boolean>(false);
  const selectedLessonIdRef = useRef<string | null>(null);
  const seekAttemptsRef = useRef<number>(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Function to attempt seeking with retries
  const attemptSeek = (time: number) => {
    if (!videoRef.current) {
      console.log("❌ Cannot seek: videoRef.current is null");
      return false;
    }

    try {
      console.log(`🎯 Attempting to seek to ${time}s (attempt ${seekAttemptsRef.current + 1})`);
      videoRef.current.currentTime = time;
      console.log(`✅ Seek successful, current time now: ${videoRef.current.currentTime}`);
      hasRestoredRef.current = true;
      pendingSeekTime.current = null;
      seekAttemptsRef.current = 0;
      return true;
    } catch (error) {
      console.log(`❌ Seek failed:`, error);
      return false;
    }
  };

  // Function to get tracker ID for a lesson
  const getTrackerId = async (lessonId: string) => {
    try {
      console.log("🔍 Getting tracker ID for lesson:", lessonId);
      
      const response = await fetch(
        `${API_URL}/api/video/get-tracker-id/${lessonId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get tracker ID: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Tracker ID response:", data);
      
      if (data.data) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error getting tracker ID:", error);
      return null;
    }
  };

  // Function to track video progress (create or update)
  const trackVideoProgress = async (
    lessonId: string,
    currentTime: number,
    videoFinished: boolean
  ) => {
    console.log("🎯 trackVideoProgress called with:", { lessonId, currentTime, videoFinished });
    
    try {
      if (!lessonId) {
        console.error("❌ No lessonId provided");
        return;
      }
      
      if (typeof currentTime !== 'number' || isNaN(currentTime)) {
        console.error("❌ Invalid currentTime:", currentTime);
        return;
      }


      const trackerId = videoTrackerIds.get(lessonId);
      console.log("📋 Tracker ID for lesson:", trackerId);
      
      if (finishedLessons.has(lessonId) && !videoFinished) {
        console.log("⏭️ Lesson already finished, skipping non-finished save");
        return;
      }

      const roundedTime = Math.round(currentTime * 100) / 100;
      console.log("⏱️ Rounded time:", roundedTime);
      
      setLessonProgress(prev => new Map(prev).set(lessonId, roundedTime));
      
      if (trackerId) {
        console.log("📤 Updating existing tracking with PUT request");
        const response = await fetch(
          `${API_URL}/api/video/update-track-video/${trackerId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              videoTrackTime: roundedTime,
              videoFinished: videoFinished,
            }),
          }
        );

        console.log("📥 PUT Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update video tracking: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Video tracking updated for lesson ${lessonId}:`, data);
        
        if (data.data) {
          setLessonProgress(prev => new Map(prev).set(lessonId, data.data.videoTrackTime));
          
          if (data.data.videoFinished && !finishedLessons.has(lessonId)) {
            setFinishedLessons(prev => {
              const newSet = new Set(prev);
              newSet.add(lessonId);
              return newSet;
            });
            setCompletedLessons(prev => {
              const newSet = new Set(prev);
              newSet.add(lessonId);
              return newSet;
            });
          }
        }
      } else {
        console.log("📤 Creating new tracking with POST request");
        const response = await fetch(`${API_URL}/api/video/track-video`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            videoTrackTime: roundedTime,
            videoFinished: videoFinished,
            lessonId: lessonId,
            courseId: courseId,
          }),
        });

        console.log("📥 POST Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to track video: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Video tracked for lesson ${lessonId}:`, data);
        
        if (data.data?.id) {
          console.log("💾 Storing tracker ID:", data.data.id);
          setVideoTrackerIds(prev => new Map(prev).set(lessonId, data.data.id));
          
          if (data.data.videoTrackTime) {
            setLessonProgress(prev => new Map(prev).set(lessonId, data.data.videoTrackTime));
          }
          
          if (data.data.videoFinished) {
            setFinishedLessons(prev => {
              const newSet = new Set(prev);
              newSet.add(lessonId);
              return newSet;
            });
            setCompletedLessons(prev => {
              const newSet = new Set(prev);
              newSet.add(lessonId);
              return newSet;
            });
          }
        }
      }

      setLastSavedTime(prev => new Map(prev).set(lessonId, roundedTime));
      
      if (videoFinished) {
        console.log("🏁 Marking lesson as finished:", lessonId);
        setFinishedLessons(prev => {
          const newSet = new Set(prev);
          newSet.add(lessonId);
          return newSet;
        });
        
        setCompletedLessons(prev => {
          const newSet = new Set(prev);
          newSet.add(lessonId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("❌ Error in trackVideoProgress:", error);
    }
  };

  // Handle video pause
  const handleVideoPause = () => {
    console.log("⏸️ handleVideoPause triggered");
    const lessonId = expandedLesson || selectedLessonId;
    
    if (videoRef.current && lessonId) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const videoFinished = currentTime >= duration * 0.95 || currentTime === duration;
      
      console.log(`📊 Video paused at ${currentTime}s, duration: ${duration}s, finished: ${videoFinished}`);
      
      trackVideoProgress(lessonId, currentTime, videoFinished);
    }
  };

  // Handle video play
  const handleVideoPlay = () => {
    console.log("▶️ Video play triggered");
    const lessonId = expandedLesson || selectedLessonId;
    if (lessonId) {
      console.log(`Video resumed for lesson ${lessonId}`);
    }
  };

  // Handle video end
  const handleVideoEnded = () => {
    console.log("⏹️ Video ended triggered");
    const lessonId = expandedLesson || selectedLessonId;
    
    if (videoRef.current && lessonId) {
      const duration = videoRef.current.duration;
      console.log(`Video ended at ${duration}s - marking as finished`);
      
      trackVideoProgress(lessonId, duration, true);
    }
  };

  // Handle video time update - save every 30 seconds and update progress bar
  const handleTimeUpdate = () => {
    const lessonId = expandedLesson || selectedLessonId;
    
    if (videoRef.current && lessonId && !finishedLessons.has(lessonId)) {
      const currentTime = videoRef.current.currentTime;
      
      setLessonProgress(prev => new Map(prev).set(lessonId, currentTime));
      
      const lastSaved = lastSavedTime.get(lessonId) || 0;
      if (Math.floor(currentTime) % 30 === 0 && Math.abs(currentTime - lastSaved) >= 30) {
        console.log(`💾 Auto-saving at ${currentTime}s`);
        trackVideoProgress(lessonId, currentTime, false);
      }
    }
  };

  // Handle video metadata loaded - store duration
  const handleLoadedMetadata = () => {
    if (videoRef.current && selectedLessonIdRef.current) {
      const duration = videoRef.current.duration;
      console.log(`📹 Video metadata loaded for lesson ${selectedLessonIdRef.current}, duration: ${duration}`);
      setVideoDurations(prev => new Map(prev).set(selectedLessonIdRef.current!, duration));
      
      // Try to seek if we have a pending time
      if (pendingSeekTime.current !== null && !hasRestoredRef.current) {
        console.log(`⏩ Attempting to seek to pending time in loadedmetadata: ${pendingSeekTime.current}s`);
        attemptSeek(pendingSeekTime.current);
      }
    }
  };

  // Handle lesson selection
  const handleLessonSelect = async (lessonId: string, videoUrl: string) => {
    console.log("📚 Lesson selected:", lessonId);
    setLoadingLesson(true);
    
    // Reset refs
    hasRestoredRef.current = false;
    pendingSeekTime.current = null;
    selectedLessonIdRef.current = lessonId;
    seekAttemptsRef.current = 0;
    
    try {
      setSelectedLessonId(lessonId);
      setSelectedVideo(videoUrl);
      setExpandedLesson(lessonId);
      
      console.log("📊 Current videoTrackerIds before fetch:", Array.from(videoTrackerIds.entries()));
      
      // Check if we already have tracker ID
      if (!videoTrackerIds.has(lessonId)) {
        const trackerData = await getTrackerId(lessonId);
        
        if (trackerData) {
          console.log("✅ Found existing tracking data:", trackerData);
          
          // Update all states with the fetched data
          setVideoTrackerIds(prev => {
            const newMap = new Map(prev);
            newMap.set(lessonId, trackerData.id);
            console.log("📊 Updated videoTrackerIds:", Array.from(newMap.entries()));
            return newMap;
          });
          
          setLessonProgress(prev => {
            const newMap = new Map(prev);
            newMap.set(lessonId, trackerData.videoTrackTime);
            console.log("📊 Updated lessonProgress:", Array.from(newMap.entries()));
            return newMap;
          });
          
          // Set pending seek time
          if (trackerData.videoTrackTime > 0 && !trackerData.videoFinished) {
            console.log(`⏳ Setting pending seek time to: ${trackerData.videoTrackTime}s`);
            pendingSeekTime.current = trackerData.videoTrackTime;
            
            // Try to seek immediately if video is already loaded
            if (videoRef.current && videoRef.current.readyState >= 1) {
              console.log("🎬 Video already loaded, attempting immediate seek");
              setTimeout(() => {
                attemptSeek(trackerData.videoTrackTime);
              }, 100);
            }
          }
          
          if (trackerData.videoFinished) {
            console.log("🏁 Lesson was previously finished");
            setFinishedLessons(prev => {
              const newSet = new Set(prev);
              newSet.add(lessonId);
              return newSet;
            });
            setCompletedLessons(prev => {
              const newSet = new Set(prev);
              newSet.add(lessonId);
              return newSet;
            });
          }
        } else {
          console.log("🆕 No existing tracking data for this lesson");
          setLessonProgress(prev => {
            const newMap = new Map(prev);
            newMap.set(lessonId, 0);
            return newMap;
          });
        }
      } else {
        console.log("📋 Using existing tracker ID for lesson:", lessonId);
        const existingProgress = lessonProgress.get(lessonId);
        if (existingProgress && existingProgress > 0 && !finishedLessons.has(lessonId)) {
          console.log(`⏳ Setting pending seek time to existing progress: ${existingProgress}s`);
          pendingSeekTime.current = existingProgress;
          
          // Try to seek immediately if video is already loaded
          if (videoRef.current && videoRef.current.readyState >= 1) {
            console.log("🎬 Video already loaded, attempting immediate seek");
            setTimeout(() => {
              attemptSeek(existingProgress);
            }, 100);
          }
        }
      }
      
      setLoadingLesson(false);
      
    } catch (error) {
      console.error("❌ Error selecting lesson:", error);
      setLoadingLesson(false);
    }
  };

  // Modified toggleModule to also select the first lesson
  const toggleModule = async (moduleId: string) => {
    if (expandedModule === moduleId) {
      // If collapsing, just collapse
      setExpandedModule(null);
      setExpandedLesson(null);
      setSelectedVideo(null);
      setSelectedLessonId(null);
      selectedLessonIdRef.current = null;
      hasRestoredRef.current = false;
      pendingSeekTime.current = null;
    } else {
      // If expanding, expand and select first lesson
      setExpandedModule(moduleId);
      
      // Find the module and its first lesson
      const module = modules.find(m => m.id === moduleId);
      const firstLesson = module?.lesson?.[0];
      
      if (firstLesson) {
        // Automatically select the first lesson
        await handleLessonSelect(firstLesson.id, firstLesson.lesson_video);
      }
    }
  };

  const toggleLesson = (lessonId: string, videoUrl: string) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
      setSelectedVideo(null);
      setSelectedLessonId(null);
      selectedLessonIdRef.current = null;
      hasRestoredRef.current = false;
      pendingSeekTime.current = null;
    } else {
      handleLessonSelect(lessonId, videoUrl);
    }
  };

  const handleRadioChange = (
    lessonId: string,
    videoUrl: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();
    
    if (e.target.checked) {
      handleLessonSelect(lessonId, videoUrl);
    } else {
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null);
        setSelectedVideo(null);
        setExpandedLesson(null);
        selectedLessonIdRef.current = null;
        hasRestoredRef.current = false;
        pendingSeekTime.current = null;
      }
    }
  };

  // Effect to watch for video element changes
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    const handleCanPlay = () => {
      console.log("🎬 Video can play now");
      if (pendingSeekTime.current !== null && !hasRestoredRef.current) {
        console.log(`🎬 Attempting to seek to ${pendingSeekTime.current}s in canplay`);
        attemptSeek(pendingSeekTime.current);
      }
    };

    const handleSeeked = () => {
      console.log(`📌 Video seeked to ${video.currentTime}s`);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []); // Empty dependency array since we're using refs

  // Fetch course modules
  useEffect(() => {
    const fetchCourseModules = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/api/course/get-course/${courseId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch course: ${res.status}`);
        }

        const data = await res.json();
        setModules(data.data.module || []);
      } catch (error) {
        console.error("Error fetching course modules:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseModules();
    }
  }, [courseId, API_URL]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader
          height={40}
          width={40}
          border_width={3}
          full_border_color="transparent"
          small_border_color="#FFA500"
        />
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <div key="dashboard-content">
          <SubHeader backFunction={backFunction} header={course_title} />
          <motion.div
            key="video_animation"
            initial={{
              height: 0,
            }}
            animate={{ height: 374 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!selectedVideo ? (
              <div className="dashboard_content_mainbox flex justify-center items-center border-2 border-dashed border-nearTextColors-0/20 h-[374px]">
                <h1 className="text-nearTextColors-0 text-center w-[300px] text-[20px] font-semibold">
                  Select a module to start watching your first lesson.
                </h1>
              </div>
            ) : (
              <motion.div className="relative">
                {loadingLesson && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                      <Loader
                        height={24}
                        width={24}
                        border_width={2}
                        full_border_color="transparent"
                        small_border_color="#FFA500"
                      />
                      <span className="text-gray-700">Loading lesson...</span>
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  src={selectedVideo as any}
                  controls
                  className="w-full h-[374px] cover"
                  onPause={handleVideoPause}
                  onPlay={handleVideoPlay}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={(e) => {
                    console.error("❌ Video failed to load:", selectedVideo, e);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </motion.div>
            )}
          </motion.div>

          <div key="Multiple-videos" className="w-full dashboard_content_mainbox">
            {modules.length === 0 ? (
              <div className="p-4">No modules found for this course.</div>
            ) : (
              modules.map((module) => (
                <div key={module.id} className="mb-4 border-b border-gray-200">
                  {/* Module Header */}
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div>
                      <h3 className="font-medium">{module.module_title}</h3>
                      <p className="text-sm text-gray-500">
                        {module.lesson?.length || 0} lessons •{" "}
                        {module.module_duration}
                      </p>
                    </div>
                    <MdChevronRight
                      className={`transform transition-transform ${
                        expandedModule === module.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {/* Module Content */}
                  {expandedModule === module.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4"
                    >
                      {/* Module Description */}
                      <p className="text-[14px] text-nearTextColors-0 pb-3">
                        {module.module_description}
                      </p>

                      {/* Lessons List */}
                      {module.lesson?.map((lesson) => {
                        const isFinished = finishedLessons.has(lesson.id);
                        const progress = lessonProgress.get(lesson.id) || 0;
                        const duration = videoDurations.get(lesson.id) || (lesson.duration ? lesson.duration * 60 : 300);
                        
                        const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;
                        
                        return (
                          <div key={lesson.id} className="border-t border-gray-100">
                            <div
                              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                                selectedLessonId === lesson.id ? 'bg-blue-50' : ''
                              } ${isFinished ? 'bg-green-50' : ''}`}
                              onClick={() =>
                                toggleLesson(lesson.id, lesson.lesson_video)
                              }
                            >
                              <input
                                type="radio"
                                name="selectedLesson"
                                checked={selectedLessonId === lesson.id}
                                onChange={(e) =>
                                  handleRadioChange(
                                    lesson.id,
                                    lesson.lesson_video,
                                    e,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-blue-600"
                                disabled={isFinished}
                              />
                              <MdChevronRight
                                className={`transform transition-transform ${
                                  expandedLesson === lesson.id ? "rotate-90" : ""
                                }`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className={`font-medium ${isFinished ? 'text-green-600 line-through' : ''}`}>
                                    {lesson.lesson_title}
                                  </span>
                                  {isFinished && (
                                    <span className="ml-2 text-xs text-green-600 font-normal">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                                {!isFinished && progress > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                                    <div 
                                      className="bg-primaryColors-0 h-1.5 rounded-full transition-all duration-300" 
                                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                    ></div>
                                  </div>
                                )}
                                {process.env.NODE_ENV === 'development' && !isFinished && progress > 0 && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {Math.round(progress)}s / {Math.round(duration)}s ({Math.round(progressPercentage)}%)
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <GoVideo />
                                <span>
                                  {lesson.duration
                                    ? `${lesson.duration}min`
                                    : "5min"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}