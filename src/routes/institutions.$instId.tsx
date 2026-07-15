import { createFileRoute, Link } from '@tanstack/react-router'
import { useSyncExternalStore, useState, useMemo } from 'react'
import { store } from '../lib/mock-store'
import { MapPin, Users, Award, Calendar, ExternalLink, Image as ImageIcon, Heart, MessageCircle, Share2, Target, Leaf } from 'lucide-react'

export const Route = createFileRoute('/institutions/$instId')({
  component: InstitutionRoute,
})

function InstitutionRoute() {
  const { instId } = Route.useParams()
  const storeState = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const { users, posts, events, challenges } = storeState
  
  const institution = users.find(u => u.id === instId && u.accountType === 'Institutional')
  
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'campaigns' | 'events'>('overview')

  // Derived data for the institution
  const instPosts = useMemo(() => posts.filter(p => p.authorId === instId), [posts, instId])
  const instEvents = useMemo(() => events.filter(e => e.organizerId === instId), [events, instId])
  const instChallenges = useMemo(() => challenges.filter(c => c.sponsorId === instId), [challenges, instId])
  
  // Mock followers based on points
  const followersCount = institution ? Math.floor(institution.points * 0.1) : 0

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full inline-block mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Institution Not Found</h2>
          <p className="text-gray-500 mb-6">The institution you're looking for doesn't exist or has been removed.</p>
          <Link to="/community" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Return to Community
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Cover Image */}
      <div className="h-48 md:h-64 lg:h-80 w-full bg-emerald-800 relative overflow-hidden">
        <img 
          src={`https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2000`}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          alt="Institution Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        {/* Header Profile Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
            <div className="relative -mt-12 sm:-mt-16 bg-white p-2 rounded-xl shadow-md">
              <img 
                src={institution.avatar || `https://ui-avatars.com/api/?name=${institution.orgName}&background=random`}
                alt={institution.orgName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-sm" title="Verified Institution">
                <Target className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{institution.orgName}</h1>
                  <p className="text-gray-500 font-medium">{institution.orgType || 'Environmental Partner'}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {institution.orgLocation || institution.location}
                    </div>
                    {institution.orgEmail && (
                      <div className="flex items-center gap-1.5">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${institution.orgEmail}`} className="hover:text-emerald-600 transition-colors">{institution.orgEmail}</a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    Follow
                  </button>
                  <button className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{followersCount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{institution.points.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Impact Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{instChallenges.length}</div>
              <div className="text-sm text-gray-500">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{instEvents.length}</div>
              <div className="text-sm text-gray-500">Events Hosted</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-6 scrollbar-hide border-b border-gray-200">
          {(['overview', 'posts', 'campaigns', 'events'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-emerald-600 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">About {institution.orgName}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We are dedicated to fostering environmental sustainability through community engagement, massive recycling drives, and awareness campaigns. Join us in making the planet greener.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Key Achievements
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <Leaf className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">10,000kg Plastic Recycled</div>
                        <div className="text-sm text-gray-500">Awarded for milestone in plastic recovery (2024)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Community Champion</div>
                        <div className="text-sm text-gray-500">Most active institutional member in Q3</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-6">
                {instPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Posts Yet</h3>
                    <p className="text-gray-500">This institution hasn't shared any updates.</p>
                  </div>
                ) : (
                  instPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={institution.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{institution.orgName}</div>
                          <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <img src={post.mediaUrls[0]} className="w-full h-64 object-cover rounded-xl mb-4" alt="Post media" />
                      )}
                      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                        <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.likesCount}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.commentsCount}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors ml-auto">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                {instChallenges.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <p className="text-gray-500">No active campaigns.</p>
                  </div>
                ) : (
                  instChallenges.map(challenge => (
                    <div key={challenge.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {challenge.status}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{challenge.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm mb-5">
                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg font-medium text-gray-700 flex items-center gap-2">
                          <Target className="w-4 h-4 text-emerald-500" /> Goal: {challenge.targetMetric}
                        </div>
                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg font-medium text-gray-700 flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" /> Reward: {challenge.rewardPoints} pts
                        </div>
                      </div>
                      <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2.5 rounded-xl transition-colors">
                        View Campaign
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                {instEvents.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <p className="text-gray-500">No upcoming events.</p>
                  </div>
                ) : (
                  instEvents.map(evt => (
                    <div key={evt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-5">
                      <img src={evt.imageUrl} alt={evt.title} className="w-full sm:w-32 h-32 object-cover rounded-xl shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{evt.title}</h3>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{evt.description}</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(evt.startDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evt.location}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {evt.participantsCount}/{evt.maxParticipants}</span>
                        </div>
                        <Link to="/events" className="text-emerald-600 font-medium text-sm hover:underline">
                          View Event Details &rarr;
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {institution.orgEmail && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                    </div>
                    <span>{institution.orgEmail}</span>
                  </div>
                )}
                {institution.orgPhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <span>{institution.orgPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </div>
                  <span>{institution.orgLocation || institution.location}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
