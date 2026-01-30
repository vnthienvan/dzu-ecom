import React, { useState } from 'react';
import { Conversation, ChatMessage } from '../types';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Image, Smile, CheckCheck, MessageSquareText, Bot } from 'lucide-react';

const mockConversations: Conversation[] = [
    { 
        id: 'c_bot', userId: 'bot', userName: 'Dzu Bot (System)', userAvatar: 'Bot', lastMessage: 'Admin đã thêm bình luận vào Task #t1', unreadCount: 1, updatedAt: 'Just now', status: 'bot',
        messages: [
            { id: 'm_b1', senderId: 'bot', text: '🔔 Thông báo: Công việc "Tối ưu quảng cáo Tết" đã được tạo bởi Admin.', timestamp: '09:00 AM', isRead: true, type: 'system' },
            { id: 'm_b2', senderId: 'bot', text: '💬 Bình luận mới trong Task #t1: "Chú ý ngân sách không được vượt quá 6M nhé" - bởi Admin.', timestamp: 'Just now', isRead: false, type: 'system', relatedTaskId: 't1' },
        ]
    },
    { 
        id: 'c1', userId: 'u2', userName: 'Manager Hoa', userAvatar: 'M', lastMessage: 'Đã duyệt camp Tết chưa em?', unreadCount: 2, updatedAt: '10:30 AM', status: 'online',
        messages: [
            { id: 'm1', senderId: 'u2', text: 'Chào em', timestamp: '10:00 AM', isRead: true, type: 'text' },
            { id: 'm2', senderId: 'me', text: 'Dạ chào chị', timestamp: '10:05 AM', isRead: true, type: 'text' },
            { id: 'm3', senderId: 'u2', text: 'Đã duyệt camp Tết chưa em?', timestamp: '10:30 AM', isRead: false, type: 'text' },
        ]
    },
    { 
        id: 'c2', userId: 'u3', userName: 'Staff Tuấn', userAvatar: 'T', lastMessage: 'Gửi file báo cáo tuần rồi ạ', unreadCount: 0, updatedAt: 'Yesterday', status: 'offline',
        messages: [
            { id: 'm1', senderId: 'u3', text: 'Gửi file báo cáo tuần rồi ạ', timestamp: 'Yesterday', isRead: true, type: 'file' },
        ]
    },
    { 
        id: 'c3', userId: 'c1', userName: 'Khách hàng - Dzu Fashion', userAvatar: 'D', lastMessage: 'Ok chốt plan này nhé', unreadCount: 0, updatedAt: '2 days ago', status: 'busy',
        messages: []
    }
];

const ChatSystem: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [selectedId, setSelectedId] = useState<string>('c_bot');
    const [messageInput, setMessageInput] = useState('');

    const activeConv = conversations.find(c => c.id === selectedId);

    const handleSend = () => {
        if (!messageInput.trim() || !activeConv) return;
        
        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            text: messageInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'text'
        };

        const updatedConvs = conversations.map(c => {
            if (c.id === selectedId) {
                return {
                    ...c,
                    messages: [...c.messages, newMsg],
                    lastMessage: messageInput,
                    updatedAt: 'Just now'
                };
            }
            return c;
        });

        setConversations(updatedConvs);
        setMessageInput('');
    };

    return (
        <div className="h-[calc(100vh-6rem)] bg-white border border-slate-200 rounded-xl shadow-sm flex overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-3">Tin nhắn</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map(conv => (
                        <div 
                            key={conv.id} 
                            onClick={() => setSelectedId(conv.id)}
                            className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-100 hover:bg-slate-100
                                ${selectedId === conv.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : ''}
                            `}
                        >
                            <div className="relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold 
                                    ${conv.status === 'bot' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}
                                `}>
                                    {conv.status === 'bot' ? <Bot size={20} /> : (conv.userAvatar || conv.userName.charAt(0))}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                    ${conv.status === 'online' ? 'bg-green-500' : conv.status === 'busy' ? 'bg-red-500' : conv.status === 'bot' ? 'bg-blue-400' : 'bg-slate-400'}
                                `}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="font-semibold text-slate-900 text-sm truncate">{conv.userName}</h3>
                                    <span className="text-[10px] text-slate-500">{conv.updatedAt}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                                        {conv.lastMessage}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {activeConv ? (
                <div className="flex-1 flex flex-col bg-white">
                    {/* Header */}
                    <div className="h-16 px-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold 
                                    ${activeConv.status === 'bot' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}
                                `}>
                                    {activeConv.status === 'bot' ? <Bot size={20} /> : (activeConv.userAvatar || activeConv.userName.charAt(0))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{activeConv.userName}</h3>
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    {activeConv.status === 'online' ? 'Đang hoạt động' : activeConv.status === 'bot' ? 'Hệ thống tự động' : 'Không hoạt động'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <button className="hover:text-indigo-600"><Phone size={20} /></button>
                            <button className="hover:text-indigo-600"><Video size={20} /></button>
                            <button className="hover:text-slate-600"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
                        {activeConv.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative group
                                    ${msg.type === 'system' ? 'bg-indigo-50 border border-indigo-100 text-indigo-800 w-full max-w-[90%]' : 
                                      msg.senderId === 'me' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}
                                `}>
                                    <p className="text-sm">
                                        {msg.type === 'system' && <strong className="block text-indigo-600 mb-1 text-xs uppercase">System Update</strong>}
                                        {msg.text}
                                    </p>
                                    {msg.relatedTaskId && (
                                        <button className="mt-2 text-xs bg-white/50 px-2 py-1 rounded text-indigo-700 font-bold border border-indigo-200 hover:bg-white transition-colors">
                                            Xem Task #{msg.relatedTaskId}
                                        </button>
                                    )}
                                    <div className={`text-[10px] mt-1 flex items-center gap-1 justify-end
                                        ${msg.senderId === 'me' ? 'text-indigo-200' : 'text-slate-400'}
                                    `}>
                                        {msg.timestamp}
                                        {msg.senderId === 'me' && (
                                            msg.isRead ? <CheckCheck size={12} /> : <CheckCheck size={12} className="opacity-50" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
                                <Paperclip size={20} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 hidden sm:block">
                                <Image size={20} />
                            </button>
                            <textarea
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 text-slate-800 placeholder:text-slate-400"
                                rows={1}
                            />
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
                                <Smile size={20} />
                            </button>
                            <button 
                                onClick={handleSend}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 flex-col gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <MessageSquareText size={32} />
                    </div>
                    <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
                </div>
            )}
        </div>
    );
};

export default ChatSystem;