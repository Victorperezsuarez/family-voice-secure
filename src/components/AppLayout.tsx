import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { usePorcupineWakeWord } from '@/hooks/usePorcupineWakeWord';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { WaveformVisualizer } from './WaveformVisualizer';
import { RecordingButton } from './RecordingButton';
import MobileAppLayout from './MobileAppLayout';

import { FamilyMemberCard } from './FamilyMemberCard';
import { RecordingCard } from './RecordingCard';
import { AudioPlayer } from './AudioPlayer';
import { AddMemberModal } from './AddMemberModal';
import { SaveRecordingModal } from './SaveRecordingModal';
import { LanguageSelector } from './LanguageSelector';
import { VoiceCommandIndicator } from './VoiceCommandIndicator';
import { AdvancedSearchBar } from './AdvancedSearchBar';
import { ComprehensiveSearchResults } from './ComprehensiveSearchResults';
import { SemanticSearchBar } from './SemanticSearchBar';
import { SemanticSearchResults } from './SemanticSearchResults';
import { SearchResults } from './SearchResults';
import { SearchFilters, SearchResult } from '@/types/search';
import { ExportModal } from './ExportModal';
import { BackupManagementView } from './BackupManagementView';
import { FamilySwitcher } from './FamilySwitcher';
import { CreateFamilyModal } from './CreateFamilyModal';
import { FamilyDashboard } from './FamilyDashboard';
import { FamilySettingsPanel } from './FamilySettingsPanel';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { MobileRecordingInterface } from './MobileRecordingInterface';
import { TouchGestureHandler } from './TouchGestureHandler';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { PullToRefresh } from './PullToRefresh';
import { OfflineIndicator } from './OfflineIndicator';
import { SyncStatusBadge } from './SyncStatusBadge';
import { OfflineSyncBanner } from './OfflineSyncBanner';
import { ConflictResolutionManager } from './ConflictResolutionManager';
import { EnhancedSyncStatusPanel } from './EnhancedSyncStatusPanel';
import { VelaDeploymentBanner } from './VelaDeploymentBanner';



import { FamilyWorkspace } from './FamilyWorkspace';
import { TimelineView } from './TimelineView';
import { CollectionsView } from './CollectionsView';
import { RemindersView } from './RemindersView';
import PrivacyManagementView from './PrivacyManagementView';
import { FamilyTreeVisualization } from './FamilyTreeVisualization';
import { EnhancedPhotoGallery } from './EnhancedPhotoGallery';
import { AudiobookLibrary } from './AudiobookLibrary';





import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Plus, Search, Users, Mic2, Volume2, User, LogOut, Settings, UserPlus, Download, Cloud, Smartphone } from 'lucide-react';




import { FamilyMember, RecordingWithMember } from '@/types/family';
import { useVela } from '@/contexts/VelaContext';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';



const DEMO_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Abuelo José', relationship: 'abuelo', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676500457_8f0adb38.webp', created_at: new Date().toISOString(), user_id: 'demo' },
  { id: '2', name: 'Abuela Carmen', relationship: 'abuela', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676501424_e6404267.webp', created_at: new Date().toISOString(), user_id: 'demo' },
  { id: '3', name: 'Papá Miguel', relationship: 'padre', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676502291_0e9c4be7.webp', created_at: new Date().toISOString(), user_id: 'demo' },
  { id: '4', name: 'Mamá Ana', relationship: 'madre', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676503209_2552df1f.webp', created_at: new Date().toISOString(), user_id: 'demo' },
  { id: '5', name: 'Carlos', relationship: 'hermano', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676504074_fa658570.webp', created_at: new Date().toISOString(), user_id: 'demo' },
  { id: '6', name: 'Sofía', relationship: 'hermana', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676505187_0978a5f0.webp', created_at: new Date().toISOString(), user_id: 'demo' },
  { id: '7', name: 'Juanito', relationship: 'hijo', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676506084_395202b2.webp', created_at: new Date().toISOString(), user_id: 'demo' },
  { id: '8', name: 'Lucía', relationship: 'hija', photo_url: 'https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676506976_6411000f.webp', created_at: new Date().toISOString(), user_id: 'demo' },
];

export default function AppLayout() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileAppLayout />;
  }

  return <DesktopAppLayout />;
}

function DesktopAppLayout() {
  const { familyMembers, recordings, isLoading, addFamilyMember, saveRecording, deleteRecording, selectMemberByName, getLastRecording, searchRecordings, advancedSearch, getRecordingsForMember } = useVela();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage } = useAppContext();
  const { checkLimit, checking } = useUsageLimit();

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSaveRecording, setShowSaveRecording] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showFamilyDashboard, setShowFamilyDashboard] = useState(false);
  const [showFamilySettings, setShowFamilySettings] = useState(false);
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');


  useEffect(() => {
    const loadCurrentFamily = async () => {
      if (!user) return;
      const { supabase } = await import('@/lib/supabase-client');
      const { data } = await supabase.from('profiles').select('current_family_id').eq('id', user.id).single();
      if (data?.current_family_id) setCurrentFamilyId(data.current_family_id);
    };
    loadCurrentFamily();
  }, [user]);




  const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string | null>(null);
  const [currentPlayingTitle, setCurrentPlayingTitle] = useState<string>('');
  const [currentPlayingRecording, setCurrentPlayingRecording] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });

  const [searchResultsRecordings, setSearchResultsRecordings] = useState<any[]>([]);
  const [searchResultsCollections, setSearchResultsCollections] = useState<any[]>([]);
  const [searchResultsMembers, setSearchResultsMembers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredRecs, setFilteredRecs] = useState<any[]>([]);
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Semantic search state
  const [semanticSearchQuery, setSemanticSearchQuery] = useState('');
  const [semanticSearchResults, setSemanticSearchResults] = useState<any[]>([]);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [showSemanticSearch, setShowSemanticSearch] = useState(false);




  // Load collections and tags on mount
  useEffect(() => {
    const loadCollectionsAndTags = async () => {
      if (!user) return;
      
      const { supabase } = await import('@/lib/supabase-client');
      
      // Load collections
      const { data: collectionsData } = await supabase
        .from('collections')
        .select('*')
        .eq('family_id', user.id);
      
      if (collectionsData) {
        setCollections(collectionsData);
      }
      
      // Extract unique tags from recordings
      const allTags = new Set<string>();
      recordings.forEach((rec: any) => {
        if (rec.tags) {
          rec.tags.forEach((tag: string) => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags));
    };
    
    loadCollectionsAndTags();
  }, [user, recordings]);

  const voiceCommands = useVoiceCommands();

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    analyser,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  // Handle voice commands
  useEffect(() => {
    if (!voiceCommands.lastCommand || !voiceControlEnabled) return;

    const cmd = voiceCommands.lastCommand;
    
    switch (cmd.type) {
      case 'SELECT_MEMBER':
        const member = selectMemberByName(cmd.name);
        if (member) {
          setSelectedMember(member);
          setFilteredRecs([]);
        }
        break;
      case 'START_RECORDING':
        if (selectedMember && !isRecording) {
          startRecording();
        }
        break;
      case 'STOP_RECORDING':
        if (isRecording) {
          stopRecording();
        }
        break;
      case 'PAUSE_RECORDING':
        if (isRecording && !isPaused) {
          pauseRecording();
        }
        break;
      case 'RESUME_RECORDING':
        if (isRecording && isPaused) {
          resumeRecording();
        }
        break;
      case 'PLAY_LAST':
        const lastRec = getLastRecording();
        if (lastRec) {
          handlePlayRecording(lastRec);
        }
        break;
      case 'DELETE_RECORDING':
        const lastRecToDelete = getLastRecording();
        if (lastRecToDelete) {
          deleteRecording(lastRecToDelete.id);
        }
        break;
      case 'SEARCH':
        const results = searchRecordings(cmd.keyword);
        setFilteredRecs(results);
        setSearchQuery(cmd.keyword);
        break;
      case 'SEMANTIC_SEARCH':
        handleSemanticSearch(cmd.query);
        break;
      case 'ADD_MEMBER':
        setShowAddMember(true);
        break;
      case 'CHANGE_LANGUAGE':
        setLanguage(cmd.language);
        break;
      case 'SHOW_MEMBER_RECORDINGS':
        const memberRecs = getRecordingsForMember(cmd.name);
        setFilteredRecs(memberRecs);
        break;
      case 'CANCEL':
        if (isRecording) {
          resetRecording();
        }
        setSelectedMember(null);
        setFilteredRecs([]);
        break;
    }
  }, [voiceCommands.lastCommand]);



  useEffect(() => {
    if (audioBlob && !isRecording) {
      setShowSaveRecording(true);
    }
  }, [audioBlob, isRecording]);

  const handleAddMember = async (memberData: { name: string; relationship: string; photo_url: string }) => {
    await addFamilyMember(memberData);
  };

  const handleSaveRecording = async (title: string, tags: string[]) => {
    if (!audioBlob || !selectedMember) return;

    const recordingData = {
      title,
      family_member_id: selectedMember.id,
      audio_url: '',
      duration,
      tags,
      transcription_status: 'processing'
    };

    const savedRecording = await saveRecording(recordingData, audioBlob, language);

    // Trigger transcription after saving
    if (savedRecording?.id) {
      const { supabase } = await import('@/lib/supabase-client');
      await supabase.functions.invoke('transcribe-audio', {
        body: { 
          recordingId: savedRecording.id,
          audioUrl: savedRecording.audio_url,
          language 
        }
      });
    }

    resetRecording();
    setSelectedMember(null);
  };

  const handlePlayRecording = (recording: any) => {
    setCurrentPlayingUrl(recording.audio_url);
    setCurrentPlayingTitle(recording.title);
    setCurrentPlayingRecording(recording);
  };

  const handleTranscriptionUpdate = async (transcription: string) => {
    if (currentPlayingRecording) {
      setCurrentPlayingRecording({
        ...currentPlayingRecording,
        transcription
      });
    }
  };


  const handleAdvancedSearch = async (query: string, filters: SearchFilters) => {
    setSearchFilters(filters);

    setSearchFilters(filters);
    setIsSearching(true);
    
    if (!user) return;
    
    const { supabase } = await import('@/lib/supabase-client');
    
    // Search recordings
    let recordingsQuery = supabase
      .from('recordings')
      .select('*, family_members!inner(*)')
      .eq('family_members.user_id', user.id);
    
    if (filters.query) {
      recordingsQuery = recordingsQuery.or(`title.ilike.%${filters.query}%,transcription.ilike.%${filters.query}%,summary.ilike.%${filters.query}%`);
    }
    if (filters.memberId && filters.memberId !== 'all') {
      recordingsQuery = recordingsQuery.eq('family_member_id', filters.memberId);
    }
    if (filters.eventType && filters.eventType !== 'all') {
      recordingsQuery = recordingsQuery.eq('event_type', filters.eventType);
    }
    if (filters.tags && filters.tags.length > 0) {
      recordingsQuery = recordingsQuery.contains('tags', filters.tags);
    }
    if (filters.dateFrom) {
      recordingsQuery = recordingsQuery.gte('created_at', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      recordingsQuery = recordingsQuery.lte('created_at', filters.dateTo.toISOString());
    }
    
    const { data: recordingsData } = await recordingsQuery;
    setSearchResultsRecordings(recordingsData || []);
    
    // Search collections
    let collectionsQuery = supabase
      .from('collections')
      .select('*')
      .eq('family_id', user.id);
    
    if (filters.query) {
      collectionsQuery = collectionsQuery.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }
    if (filters.collectionId && filters.collectionId !== 'all') {
      collectionsQuery = collectionsQuery.eq('id', filters.collectionId);
    }
    
    const { data: collectionsData } = await collectionsQuery;
    setSearchResultsCollections(collectionsData || []);
    
    // Search family members
    let membersQuery = supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user.id);
    
    if (filters.query) {
      membersQuery = membersQuery.or(`name.ilike.%${filters.query}%,relationship.ilike.%${filters.query}%,notes.ilike.%${filters.query}%`);
    }
    if (filters.memberId && filters.memberId !== 'all') {
      membersQuery = membersQuery.eq('id', filters.memberId);
    }
    
    const { data: membersData } = await membersQuery;
    setSearchResultsMembers(membersData || []);
  };

  const handleSemanticSearch = async (query: string) => {
    setSemanticSearchQuery(query);
    setIsSemanticSearching(true);
    setShowSemanticSearch(true);
    
    try {
      const { supabase } = await import('@/lib/supabase-client');
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { query, familyId: user?.id, threshold: 0.6, limit: 20 }
      });
      
      if (error) throw error;
      setSemanticSearchResults(data?.results || []);
    } catch (error) {
      console.error('Semantic search error:', error);
      setSemanticSearchResults([]);
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const handleViewCollection = (collection: any) => {
    // Navigate to collections tab or show collection details
    console.log('View collection:', collection);
  };

  const handleViewMember = (member: FamilyMember) => {
    setSelectedMember(member);
    const memberRecs = getRecordingsForMember(member.name);
    setFilteredRecs(memberRecs);
    setIsSearching(false);
    setShowSemanticSearch(false);
  };
  const handleRefresh = async () => {
    if (!user) return;
    const { supabase } = await import('@/lib/supabase-client');
    await loadCollectionsAndTags();
    // Reload data
    window.location.reload();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayMembers = familyMembers.length > 0 ? familyMembers : DEMO_MEMBERS;

  const displayRecordings = isSearching ? searchResultsRecordings : 
    (filteredRecs.length > 0 ? filteredRecs : 
      recordings.filter((r: any) => r.title?.toLowerCase().includes(searchQuery.toLowerCase())));



  // Show family settings if requested
  if (showFamilySettings && currentFamilyId) {
    return <FamilySettingsPanel familyId={currentFamilyId} onClose={() => setShowFamilySettings(false)} />;
  }

  // Show family dashboard if requested
  if (showFamilyDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
        <FamilyDashboard onCreateFamily={() => setShowCreateFamily(true)} />
        <CreateFamilyModal
          open={showCreateFamily}
          onClose={() => setShowCreateFamily(false)}
          onSuccess={() => {
            setShowFamilyDashboard(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }


  return (
    <>
      {/* Conflict Resolution Manager */}
      <ConflictResolutionManager />

      {/* Offline Indicator */}
      <OfflineIndicator />

    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/69010a7a5325e92f2828d404_1761676509681_daaa697f.webp"
          alt="Family Memories"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <Mic2 className="w-16 h-16 mb-4 text-amber-300" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center">Vela</h1>
          <p className="text-xl md:text-2xl text-center max-w-2xl text-amber-100">
            Preserva las historias de tu familia, una voz a la vez
          </p>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Vela Deployment Banner */}
        <VelaDeploymentBanner />

        {/* Offline Sync Banner */}
        <OfflineSyncBanner />


        {/* Header with Voice Control, Language Selector, and Profile */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3 bg-white/80 px-4 py-2 rounded-full shadow-md">
            <Mic2 className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Control por Voz</span>
            <Switch
              checked={voiceControlEnabled}
              onCheckedChange={(checked) => {
                setVoiceControlEnabled(checked);
                if (checked) {
                  voiceCommands.startListening(language);
                }
              }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sync Status Badge */}
            <SyncStatusBadge />

            {/* Family Switcher */}
            <FamilySwitcher
              onCreateFamily={() => setShowCreateFamily(true)}
              onViewAllFamilies={() => setShowFamilyDashboard(true)}
            />

            {/* Mobile Vela Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/mobile-vela')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md border-0"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>


            {/* Backup Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBackupModal(true)}
              className="bg-white/80 hover:bg-white shadow-md"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Respaldo
            </Button>
            
            {/* Export Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowExportModal(true)}
              className="bg-white/80 hover:bg-white shadow-md"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            {/* Sync Status Indicator */}
            <SyncStatusIndicator />
            
            <LanguageSelector value={language} onChange={setLanguage} />
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full bg-white/80 hover:bg-white shadow-md">
                  <User className="h-5 w-5 text-amber-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>



        {/* Recording Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-12 border-2 border-amber-200">
          <h2 className="text-3xl font-bold text-amber-900 mb-6 text-center">
            {isRecording ? 'Grabando...' : 'Selecciona un Familiar'}
          </h2>


          {!isRecording && !selectedMember && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {displayMembers.slice(0, 10).map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  isSelected={selectedMember?.id === member.id}
                  onClick={() => setSelectedMember(member)}
                />

              ))}
              <button
                onClick={() => setShowAddMember(true)}
                className="aspect-square rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-50 transition-all flex flex-col items-center justify-center gap-2 text-amber-600"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Agregar</span>
              </button>
            </div>
          )}

          {selectedMember && !isRecording && (
            <div className="text-center mb-8">
              <div className="inline-block">
                <FamilyMemberCard member={selectedMember} isSelected />
              </div>
              <p className="mt-4 text-gray-600">Presiona el botón para comenzar a grabar</p>
            </div>
          )}

          {isRecording && (
            <div className="mb-8">
              <WaveformVisualizer analyser={analyser} isActive={isRecording && !isPaused} />
              <div className="text-center mt-4">
                <p className="text-4xl font-bold text-amber-600">{formatDuration(duration)}</p>
                <p className="text-gray-600 mt-2">
                  {isPaused ? 'Pausado' : 'Grabando'}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <RecordingButton
              isRecording={isRecording}
              isPaused={isPaused}
              onStart={selectedMember ? async () => {
                const allowed = await checkLimit('recordings');
                if (allowed) startRecording();
              } : () => {}}
              onStop={stopRecording}
              onPause={pauseRecording}
              onResume={resumeRecording}
            />
          </div>
        </div>

        {/* Tabs for Recordings, Timeline, Collections, and Family Workspace */}
        {/* Tabs for Recordings, Timeline, Collections, Family Workspace, and Reminders */}
        {/* Tabs for Recordings, Timeline, Collections, Family Workspace, Reminders, and Privacy */}
        <Tabs defaultValue="recordings" className="mb-8">
          <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-9 mb-6">
            <TabsTrigger value="recordings">Grabaciones</TabsTrigger>
            <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
            <TabsTrigger value="collections">Colecciones</TabsTrigger>
            <TabsTrigger value="family">Familia</TabsTrigger>
            <TabsTrigger value="tree">Árbol Familiar</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="reminders">Recordatorios</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
            <TabsTrigger value="audiobooks">Audiolibros</TabsTrigger>
          </TabsList>








          <TabsContent value="recordings">
            <div>
              <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3 mb-6">
                <Users className="w-8 h-8" />
                Historias Familiares
              </h2>

              {/* Semantic Search Bar with Voice */}
              <div className="mb-6">
                <SemanticSearchBar 
                  onSearch={handleSemanticSearch}
                  isSearching={isSemanticSearching}
                  language={language}
                />
              </div>


              {/* Advanced Search Bar */}
              <div className="mb-6">
                <AdvancedSearchBar 
                  onSearch={handleAdvancedSearch} 
                  familyMembers={displayMembers}
                  collections={collections}
                  availableTags={availableTags}
                />
              </div>

              {/* Search Results or Regular Recordings */}
              {showSemanticSearch ? (
                <SemanticSearchResults
                  results={semanticSearchResults}
                  query={semanticSearchQuery}
                  onPlayRecording={handlePlayRecording}
                />
              ) : isSearching ? (
                <ComprehensiveSearchResults
                  recordings={searchResultsRecordings}
                  collections={searchResultsCollections}
                  members={searchResultsMembers}
                  searchQuery={searchFilters.query}
                  onPlayRecording={handlePlayRecording}
                  onViewCollection={handleViewCollection}
                  onViewMember={handleViewMember}
                  familyMembers={displayMembers}
                />

              ) : (
                <div className="grid gap-4">
                  {displayRecordings.length === 0 && (
                    <div className="text-center py-16 bg-white/50 rounded-2xl">
                      <Mic2 className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                      <p className="text-gray-600 text-lg">
                        Aún no hay grabaciones. ¡Comienza a preservar las historias de tu familia!
                      </p>
                    </div>
                  )}
                  {displayRecordings.map((recording) => (
                    <RecordingCard
                      key={recording.id}
                      recording={recording}
                      onPlay={() => handlePlayRecording(recording)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            {user && (
              <TimelineView familyId={user.id} />
            )}
          </TabsContent>

          <TabsContent value="collections">
            {user && (
              <CollectionsView familyId={user.id} />
            )}
          </TabsContent>

          <TabsContent value="family">
            <FamilyWorkspace />
          </TabsContent>
          <TabsContent value="tree">
            <FamilyTreeVisualization />
          </TabsContent>

          <TabsContent value="photos">
            {user && (
              <EnhancedPhotoGallery familyId={user.id} />
            )}
          </TabsContent>

          <TabsContent value="reminders">
            {user && (
              <RemindersView familyId={user.id} familyMembers={displayMembers} />
            )}
          </TabsContent>

          <TabsContent value="privacy">
            {user && (
              <PrivacyManagementView familyMembers={displayMembers} />
            )}
          </TabsContent>

          <TabsContent value="audiobooks">
            {user && (
              <AudiobookLibrary />
            )}
          </TabsContent>

        </Tabs>

      </div>



      {/* Voice Command Indicator */}
      <VoiceCommandIndicator 
        isListening={voiceCommands.isListening}
        lastCommand={voiceCommands.lastCommand?.type !== 'UNKNOWN' ? voiceCommands.lastCommand?.type : undefined}
      />


      {/* Modals */}
      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={handleAddMember}
      />

      <SaveRecordingModal
        open={showSaveRecording}
        onClose={() => {
          setShowSaveRecording(false);
          resetRecording();
        }}
        onSave={handleSaveRecording}
        duration={duration}
        familyId={currentFamilyId || user?.id || ''}
        audioUrl={audioBlob ? URL.createObjectURL(audioBlob) : undefined}
      />


      {/* Export Modal */}
      {user && (
        <ExportModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          familyId={user.id}
          members={displayMembers}
          collections={collections}
        />
      )}

      {/* Backup Management Modal */}
      {user && (
        <BackupManagementView
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          familyId={user.id}
        />
      )}

      {/* Audio Player */}
      {/* Audio Player */}
      {currentPlayingUrl && currentPlayingRecording && (
        <AudioPlayer
          audioUrl={currentPlayingUrl}
          title={currentPlayingTitle}
          recordingId={currentPlayingRecording.id}
          transcription={currentPlayingRecording.transcription}
          transcriptionStatus={currentPlayingRecording.transcription_status}
          onClose={() => {
            setCurrentPlayingUrl(null);
            setCurrentPlayingRecording(null);
          }}
          onTranscriptionUpdate={handleTranscriptionUpdate}
        />
      )}


      {/* Create Family Modal */}
      <CreateFamilyModal
        open={showCreateFamily}
        onClose={() => setShowCreateFamily(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
    </>

  );
}

