import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Trophy, Medal, Award, Search, TrendingUp, Users, Star, Activity, Camera, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { useStore, User } from '../lib/mock-store'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardRoute,
})

type TimeFilter = 'weekly' | 'monthly' | 'all-time'
type CategoryFilter = 'points' | 'institutions' | 'helpfulness' | 'uploads' | 'ai-scans'

function LeaderboardRoute() {
  const store = useStore()
  const { users, currentUser } = store

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('points')
  const [searchQuery, setSearchQuery] = useState('')

  // Derive stats for mock data where they don't explicitly exist
  const enhancedUsers = useMemo(() => {
    return users.map((u, i) => {
      // Mocking some values for helpfulness and AI scans to make the UI rich
      const helpfulnessScore = Math.floor((u.points * 0.3) + (u.uploadCount * 5))
      const aiScans = Math.floor(u.uploadCount * 0.8)
      
      // Mock rank changes
      const rankChange = i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'same'
      const rankChangeAmount = Math.floor(Math.random() * 5) + 1

      return {
        ...u,
        helpfulnessScore,
        aiScans,
        rankChange,
        rankChangeAmount,
      }
    })
  }, [users])

  // Filter and sort based on active category
  const sortedUsers = useMemo(() => {
    let filtered = enhancedUsers.filter(u => 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.orgName && u.orgName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (categoryFilter === 'institutions') {
      filtered = filtered.filter(u => u.accountType === 'Institutional')
    }

    return filtered.sort((a, b) => {
      // For different time filters we would typically fetch different datasets
      // Here we mock the effect by applying a multiplier based on the filter
      const multiplier = timeFilter === 'weekly' ? 0.2 : timeFilter === 'monthly' ? 0.5 : 1

      switch (categoryFilter) {
        case 'institutions':
        case 'points':
          return (b.points * multiplier) - (a.points * multiplier)
        case 'helpfulness':
          return (b.helpfulnessScore * multiplier) - (a.helpfulnessScore * multiplier)
        case 'uploads':
          return (b.uploadCount * multiplier) - (a.uploadCount * multiplier)
        case 'ai-scans':
          return (b.aiScans * multiplier) - (a.aiScans * multiplier)
        default:
          return b.points - a.points
      }
    })
  }, [enhancedUsers, categoryFilter, timeFilter, searchQuery])

  const topThree = sortedUsers.slice(0, 3)
  const restOfList = sortedUsers.slice(3)

  const getValueLabel = () => {
    switch(categoryFilter) {
      case 'points': return 'Eco Points'
      case 'institutions': return 'Total Impact Points'
      case 'helpfulness': return 'Helpfulness Score'
      case 'uploads': return 'Materials Uploaded'
      case 'ai-scans': return 'Successful Scans'
    }
  }

  const getMetricValue = (user: typeof enhancedUsers[0]) => {
    const multiplier = timeFilter === 'weekly' ? 0.2 : timeFilter === 'monthly' ? 0.5 : 1
    let val = 0
    switch(categoryFilter) {
      case 'institutions':
      case 'points': val = user.points * multiplier; break;
      case 'helpfulness': val = user.helpfulnessScore * multiplier; break;
      case 'uploads': val = user.uploadCount * multiplier; break;
      case 'ai-scans': val = user.aiScans * multiplier; break;
    }
    return Math.floor(val).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-emerald-500" />
              Impact Leaderboard
            </h1>
            <p className="text-gray-500 mt-2">See who is leading the charge in global sustainability efforts.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            {(['weekly', 'monthly', 'all-time'] as TimeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`flex-1 md:px-6 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                  timeFilter === tf 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tf.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <CategoryButton 
            active={categoryFilter === 'points'} 
            onClick={() => setCategoryFilter('points')}
            icon={<Trophy className="w-4 h-4" />}
            label="Top Recyclers"
          />
          <CategoryButton 
            active={categoryFilter === 'institutions'} 
            onClick={() => setCategoryFilter('institutions')}
            icon={<Users className="w-4 h-4" />}
            label="Institutions"
          />
          <CategoryButton 
            active={categoryFilter === 'helpfulness'} 
            onClick={() => setCategoryFilter('helpfulness')}
            icon={<Star className="w-4 h-4" />}
            label="Most Helpful"
          />
          <CategoryButton 
            active={categoryFilter === 'uploads'} 
            onClick={() => setCategoryFilter('uploads')}
            icon={<Activity className="w-4 h-4" />}
            label="Top Uploaders"
          />
          <CategoryButton 
            active={categoryFilter === 'ai-scans'} 
            onClick={() => setCategoryFilter('ai-scans')}
            icon={<Camera className="w-4 h-4" />}
            label="AI Scanners"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Top 3 Podium (Visible mostly on tablet/desktop, adapting for mobile) */}
            {topThree.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-12 mt-8 md:mt-16 px-2">
                {/* Second Place */}
                <div className="flex flex-col items-center w-1/3 max-w-[140px] transform translate-y-6">
                  <div className="relative mb-3">
                    <img 
                      src={topThree[1].avatar || `https://ui-avatars.com/api/?name=${topThree[1].fullName}&background=random`} 
                      alt={topThree[1].fullName}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-200 shadow-md object-cover"
                    />
                    <div className="absolute -bottom-3 -right-2 bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">
                      2
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-center text-sm md:text-base line-clamp-1">{topThree[1].accountType === 'Institutional' ? topThree[1].orgName : topThree[1].fullName}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">{getMetricValue(topThree[1])}</p>
                </div>

                {/* First Place */}
                <div className="flex flex-col items-center w-1/3 max-w-[160px] z-10">
                  <div className="relative mb-4">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      <Award className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                    </div>
                    <img 
                      src={topThree[0].avatar || `https://ui-avatars.com/api/?name=${topThree[0].fullName}&background=random`} 
                      alt={topThree[0].fullName}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 shadow-xl object-cover"
                    />
                    <div className="absolute -bottom-4 -right-2 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                      1
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-center text-base md:text-lg line-clamp-1">{topThree[0].accountType === 'Institutional' ? topThree[0].orgName : topThree[0].fullName}</h3>
                  <p className="text-sm font-medium text-emerald-600 mt-1">{getMetricValue(topThree[0])} {categoryFilter === 'points' || categoryFilter === 'institutions' ? 'pts' : ''}</p>
                </div>

                {/* Third Place */}
                <div className="flex flex-col items-center w-1/3 max-w-[140px] transform translate-y-8">
                  <div className="relative mb-3">
                    <img 
                      src={topThree[2].avatar || `https://ui-avatars.com/api/?name=${topThree[2].fullName}&background=random`} 
                      alt={topThree[2].fullName}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-700 shadow-md object-cover"
                    />
                    <div className="absolute -bottom-3 -right-2 bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">
                      3
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-center text-sm md:text-base line-clamp-1">{topThree[2].accountType === 'Institutional' ? topThree[2].orgName : topThree[2].fullName}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">{getMetricValue(topThree[2])}</p>
                </div>
              </div>
            )}

            {/* List View */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search users or institutions..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="hidden sm:block text-sm text-gray-500 font-medium px-4">
                  {getValueLabel()}
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {restOfList.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No results found for your search.
                  </div>
                )}
                
                {restOfList.map((user, idx) => {
                  const rank = idx + 4 // Because top 3 are extracted
                  return (
                    <div key={user.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors group">
                      
                      {/* Rank & Change */}
                      <div className="w-12 flex flex-col items-center justify-center mr-4">
                        <span className="text-lg font-bold text-gray-600 mb-1">#{rank}</span>
                        {user.rankChange === 'up' && (
                          <div className="flex items-center text-emerald-500 text-[10px] font-medium">
                            <ArrowUpRight className="w-3 h-3" /> {user.rankChangeAmount}
                          </div>
                        )}
                        {user.rankChange === 'down' && (
                          <div className="flex items-center text-red-500 text-[10px] font-medium">
                            <ArrowDownRight className="w-3 h-3" /> {user.rankChangeAmount}
                          </div>
                        )}
                        {user.rankChange === 'same' && (
                          <div className="flex items-center text-gray-300 text-[10px] font-medium">
                            <Minus className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover shadow-sm mr-4"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                          {user.accountType === 'Institutional' ? user.orgName : user.fullName}
                          {user.accountType === 'Institutional' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800" title="Verified Institution">
                              Inst.
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {user.department || user.location || 'Global Citizen'}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right ml-4">
                        <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {getMetricValue(user)}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {categoryFilter === 'points' || categoryFilter === 'institutions' ? 'pts' : 'Count'}
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Current User Card */}
            {currentUser && (
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <h3 className="text-emerald-50 font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Your Standing
                </h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.fullName}&background=random`} 
                    className="w-16 h-16 rounded-full border-2 border-white/30 shadow-sm"
                    alt={currentUser.fullName}
                  />
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {/* Calculate user's actual rank for the current filter */}
                      #{sortedUsers.findIndex(u => u.id === currentUser.id) + 1 || '--'}
                    </div>
                    <div className="text-emerald-100 text-sm">
                      Top {Math.max(1, Math.round(((sortedUsers.findIndex(u => u.id === currentUser.id) + 1) / Math.max(1, sortedUsers.length)) * 100))}% of {categoryFilter}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                  <div>
                    <div className="text-emerald-100 text-xs mb-1">Eco Points</div>
                    <div className="font-bold text-lg">{currentUser.points.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-emerald-100 text-xs mb-1">Uploads</div>
                    <div className="font-bold text-lg">{currentUser.uploadCount}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Impact Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Community Impact
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Total Points</span>
                  </div>
                  <span className="font-bold text-gray-900">1.2M+</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Items Scanned</span>
                  </div>
                  <span className="font-bold text-gray-900">45.5k</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Active Members</span>
                  </div>
                  <span className="font-bold text-gray-900">8,902</span>
                </div>
              </div>
            </div>

            {/* Achievements Snippet */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-sm">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Medal className="w-4 h-4 text-yellow-400" />
                Monthly Challenge
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                "Zero Waste September" is live. Top 10 recyclers get a premium badge and 500 bonus points!
              </p>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>12 days left</span>
                <span>65% Goal Reached</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
        active 
          ? 'bg-emerald-600 text-white shadow-md' 
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
