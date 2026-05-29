import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Skills
  skills: [],
  setSkills: (skills) => set({ skills }),

  // Current chat
  currentSkill: null,
  messages: [],
  currentConvId: null,
  uploadedFileText: '',
  skillParams: {},

  setCurrentSkill: (skill) => set({
    currentSkill: skill,
    messages: [],
    currentConvId: null,
    uploadedFileText: '',
    skillParams: {},
  }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setCurrentConvId: (id) => set({ currentConvId: id }),
  setUploadedFileText: (text) => set({ uploadedFileText: text }),
  setSkillParams: (params) => set({ skillParams: params }),
  resetChat: () => set({
    messages: [],
    currentConvId: null,
    uploadedFileText: '',
    skillParams: {},
  }),

  // Conversations
  conversations: [],
  setConversations: (conversations) => set({ conversations }),

  // Settings
  settings: null,
  setSettings: (settings) => set({ settings }),

  // Loading states
  isStreaming: false,
  setIsStreaming: (v) => set({ isStreaming: v }),
}))
