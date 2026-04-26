import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Facebook, Instagram, Twitter, Linkedin, Clock, Trash2, Star } from 'lucide-react';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const GLOBAL_EVENTS = {
  '01-01': 'New Year\'s Day',
  '02-14': 'Valentine\'s Day',
  '03-08': 'Intl. Women\'s Day',
  '04-22': 'Earth Day',
  '05-01': 'May Day',
  '10-31': 'Halloween',
  '12-25': 'Christmas',
  '12-31': 'New Year\'s Eve'
};

const ContentPlannerModal = ({ isOpen, onClose, getPreviewImage }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [draggedPostId, setDraggedPostId] = useState(null);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('instagram');
  const [scheduleTime, setScheduleTime] = useState('10:00');

  useEffect(() => {
    if (!isOpen) {
      setIsDrawerOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleCellClick = (dayStr) => {
    setSelectedDate(dayStr);
    setIsDrawerOpen(true);
  };

  const handleSchedule = async () => {
    let thumbnail = null;
    if (getPreviewImage) {
        // This simulates capturing the current design
        thumbnail = await getPreviewImage();
    }
    
    setScheduledPosts([
      ...scheduledPosts, 
      {
        id: Date.now().toString(),
        dateStr: selectedDate,
        caption,
        channel: selectedChannel,
        time: scheduleTime,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'
      }
    ]);
    setIsDrawerOpen(false);
    setCaption('');
  };

  const handleDeletePost = (e, postId) => {
    e.stopPropagation();
    setScheduledPosts(scheduledPosts.filter(p => p.id !== postId));
  };

  const handleDragStart = (e, postId) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedPostId(postId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault();
    if (draggedPostId) {
      setScheduledPosts(posts => 
        posts.map(p => p.id === draggedPostId ? { ...p, dateStr: targetDateStr } : p)
      );
      setDraggedPostId(null);
    }
  };

  // Generate Calendar Grid
  const renderCalendarCells = () => {
    const cells = [];
    
    // Previous month filler days
    for (let i = 0; i < firstDayOfMonth; i++) {
        const day = daysInPrevMonth - firstDayOfMonth + i + 1;
        cells.push(
          <div key={`prev-${i}`} className="p-2 border-r border-b border-gray-100 bg-gray-50/50 opacity-50 relative pointer-events-none min-h-[120px]">
            <span className="text-sm font-medium text-gray-400">{day}</span>
          </div>
        );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayRawStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayRawStr}`;
      const dayPosts = scheduledPosts.filter(p => p.dateStr === dateStr);
      
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const eventIdea = GLOBAL_EVENTS[`${monthStr}-${dayRawStr}`];

      cells.push(
        <div 
          key={`current-${day}`} 
          onClick={() => handleCellClick(dateStr)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, dateStr)}
          className={`pb-6 p-2 border-r border-b border-gray-100 relative group cursor-pointer transition-colors flex flex-col min-h-[120px] ${isToday ? 'bg-purple-50/10' : 'hover:bg-purple-50/30'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-purple-600 text-white' : 'text-gray-700'}`}>
              {day}
            </span>
            <button className="opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow-sm hover:shadow text-purple-600 transition-all z-10 shrink-0">
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-2 mt-1 w-full flex-1 overflow-y-auto min-h-0 pb-2 custom-scrollbar">
            {dayPosts.map(post => (
              <div 
                key={post.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, post.id)}
                className="relative group/post rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-video bg-gray-100 cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={post.thumbnail} alt="post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/post:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                  {post.channel === 'facebook' && <Facebook size={16} />}
                  {post.channel === 'instagram' && <Instagram size={16} />}
                  {post.channel === 'twitter' && <Twitter size={16} />}
                  {post.channel === 'linkedin' && <Linkedin size={16} />}
                  
                  <button 
                    onClick={(e) => handleDeletePost(e, post.id)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white ml-2 shadow-lg transition-transform hover:scale-110"
                    title="Delete Post"
                  >
                     <Trash2 size={12} />
                  </button>
                </div>
                <div className="absolute top-1 left-1 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700 flex items-center gap-1 pointer-events-none">
                  <Clock size={10} /> {post.time}
                </div>
              </div>
            ))}
          </div>
          
          {eventIdea && (
             <div className="absolute bottom-1 right-2 text-[9px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1 pointer-events-none">
                <Star size={10} /> {eventIdea}
             </div>
          )}
        </div>
      );
    }

    // Next month filler days to complete grid
    const totalCells = cells.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
        cells.push(
            <div key={`next-${i}`} className="p-2 border-r border-b border-gray-100 bg-gray-50/50 opacity-50 pointer-events-none min-h-[120px]">
              <span className="text-sm font-medium text-gray-400">{i}</span>
            </div>
          );
    }

    return cells;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-[95vw] h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-gray-200 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <CalendarIcon size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-gray-800">Content Planner</h2>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Schedule your posts seamlessly</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded hover:shadow-sm transition-all text-gray-600">
                   <ChevronLeft size={20} />
                </button>
                <span className="w-40 text-center font-bold text-gray-800 text-sm">
                   {MONTHS[month]} {year}
                </span>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded hover:shadow-sm transition-all text-gray-600">
                   <ChevronRight size={20} />
                </button>
             </div>
             <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                <X size={24} />
             </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-auto bg-white flex relative">
           {/* Grid Container */}
           <div className={`flex-1 flex flex-col min-w-[800px] transition-all duration-300 ${isDrawerOpen ? 'mr-96' : ''}`}>
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 sticky top-0 z-10 shadow-sm">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="py-3 text-center border-r border-gray-200 last:border-0">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{day}</span>
                    </div>
                ))}
              </div>
              
              {/* Calendar Cells */}
              <div 
                className="grid grid-cols-7" 
                style={{ gridAutoRows: 'minmax(120px, auto)' }}
              >
                 {renderCalendarCells()}
              </div>
           </div>

           {/* Schedule Drawer */}
           <div 
             className={`absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-100 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-300 flex flex-col z-20
                ${isDrawerOpen ? 'translate-x-0' : 'translate-x-[110%]'}
             `}
           >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-base font-bold text-gray-800">
                    Schedule for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                 </h3>
                 <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                    <X size={18} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                 {/* Channel Selection */}
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Select Channel</label>
                    <div className="grid grid-cols-4 gap-3">
                       {[
                           { id: 'instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', hover: 'hover:border-pink-300' },
                           { id: 'facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:border-blue-300' },
                           { id: 'twitter', icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50', hover: 'hover:border-sky-300' },
                           { id: 'linkedin', icon: Linkedin, color: 'text-blue-800', bg: 'bg-blue-50', hover: 'hover:border-blue-300' },
                       ].map(channel => {
                           const Icon = channel.icon;
                           const isSelected = selectedChannel === channel.id;
                           return (
                               <button 
                                 key={channel.id}
                                 onClick={() => setSelectedChannel(channel.id)}
                                 className={`aspect-square rounded-xl flex items-center justify-center transition-all border-2
                                    ${isSelected ? `border-current ${channel.color} ${channel.bg}` : `border-gray-100 text-gray-400 bg-white ${channel.hover}`}
                                 `}
                               >
                                  <Icon size={24} />
                               </button>
                           )
                       })}
                    </div>
                 </div>

                 {/* Design Preview Placeholder (Using generic or fetched) */}
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Post Design</label>
                    <div className="aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative group overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="Current Design" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-4 py-2 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-lg">Change Design</button>
                       </div>
                       <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur">
                          Current Canvas
                       </div>
                    </div>
                 </div>

                 {/* Caption */}
                 <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Caption</label>
                     <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write something engaging... #hashtags"
                        className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-700"
                     />
                 </div>

                 {/* Time Picker */}
                 <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Time</label>
                     <input 
                        type="time" 
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold text-gray-700"
                     />
                 </div>
              </div>

              {/* Action */}
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                 <button 
                   onClick={handleSchedule}
                   className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                 >
                    <CalendarIcon size={18} /> Schedule Post
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPlannerModal;
