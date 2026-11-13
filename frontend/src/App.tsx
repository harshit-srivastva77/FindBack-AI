
import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

const API_URL = 'https://findback-ai-q4we.onrender.com/api/items'

type Item = {
  id: string
  type: 'Lost' | 'Found'
  name: string
  category: string
  location: string
  date: string
  description: string
  image: string
}

type Match = {
  lost: Item
  found: Item
  score: number
}

type ApiItem = Omit<Item, 'id'> & {
  _id: string
}

function normalizeItem(item: ApiItem): Item {
  return {
    ...item,
    id: item._id,
  }
}

function getTextSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) =>
    text.toLowerCase().match(/[a-z0-9]+/g) || []

  const words1 = new Set(normalize(text1))
  const words2 = new Set(normalize(text2))

  if (words1.size === 0 || words2.size === 0) return 0

  const commonWords = [...words1].filter((word) => words2.has(word))
  const unionSize = new Set([...words1, ...words2]).size

  return commonWords.length / unionSize
}

function calculateMatchScore(lost: Item, found: Item): number {
  if (lost.type !== 'Lost' || found.type !== 'Found') return 0

  let score = 0

  if (lost.category.toLowerCase() === found.category.toLowerCase()) {
    score += 25
  }

  score += getTextSimilarity(lost.name, found.name) * 30
  score += getTextSimilarity(lost.location, found.location) * 20
  score += getTextSimilarity(lost.description, found.description) * 25

  return Math.round(score)
}

function getItemIcon(category: string): string {
  const icons: Record<string, string> = {
    Electronics: '📱',
    Bags: '🎒',
    Documents: '📄',
    Clothing: '👕',
    Accessories: '⌚',
    Books: '📚',
    Other: '📦',
  }

  return icons[category] || '📦'
}

function App() {
  const [formType, setFormType] = useState<'Lost' | 'Found' | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    location: '',
    date: '',
    description: '',
    image: '',
  })

  // Load reports from MongoDB
  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch(API_URL)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to load reports')
        }

        const loadedItems: Item[] = data.items.map(
          (item: ApiItem) => normalizeItem(item)
        )

        setItems(loadedItems)
      } catch (error) {
        console.error('Error loading reports:', error)
        alert('Unable to connect to the server. Please check your backend.')
      } finally {
        setLoadingItems(false)
      }
    }

    fetchItems()
  }, [])

  function openForm(type: 'Lost' | 'Found') {
    setFormType(type)
    setForm({
      name: '',
      category: 'Electronics',
      location: '',
      date: '',
      description: '',
      image: '',
    })
  }

  // Submit report to MongoDB
  async function submitReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!formType || submitting) return

    setSubmitting(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formType,
          ...form,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to submit report')
      }

      const savedItem = normalizeItem(data.item as ApiItem)

      setItems((previous) => [savedItem, ...previous])
      setFormType(null)

      setForm({
        name: '',
        category: 'Electronics',
        location: '',
        date: '',
        description: '',
        image: '',
      })

      alert('Your item report has been submitted successfully!')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to submit report. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Smart Matching System
  const lostItems = items.filter((item) => item.type === 'Lost')
  const foundItems = items.filter((item) => item.type === 'Found')

  const matches: Match[] = lostItems
    .flatMap((lost) =>
      foundItems.map((found) => ({
        lost,
        found,
        score: calculateMatchScore(lost, found),
      }))
    )
    .filter((match) => match.score >= 25)
    .sort((a, b) => b.score - a.score)

  const topMatch = matches[0]

  const filteredItems = items.filter((item) =>
    `${item.name} ${item.category} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">F</span>
          FindBack<span className="ai">AI</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#matches">AI Matches</a>
          <a href="#items">Browse Items</a>
        </div>

        <div className="nav-actions">
          <button className="login-btn">Log In</button>
          <button className="nav-report" onClick={() => openForm('Lost')}>
            Report an Item
          </button>
        </div>
      </nav>

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <div className="tag">✨ AI-Powered Lost & Found Platform</div>

            <h1>
              Lost something?
              <br />
              <span>Let's find it back.</span>
            </h1>

            <p>
              Reuniting people with their lost belongings through
              the power of Artificial Intelligence. Smart matching,
              faster recovery, and a community that cares.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn" onClick={() => openForm('Lost')}>
                Report Lost Item ↗
              </button>
              <button className="secondary-btn" onClick={() => openForm('Found')}>
                Report Found Item
              </button>
            </div>

            <div className="trust">
              <span>✦ Smart AI Matching</span>
              <span>✦ Easy Reporting</span>
              <span>✦ Community Driven</span>
            </div>
          </div>

          <div className="hero-visual">
            {topMatch ? (
              <>
                <div className="visual-card">
                  <div className="visual-icon">
                    {getItemIcon(topMatch.lost.category)}
                  </div>

                  <div>
                    <h3>{topMatch.lost.name}</h3>
                    <p>{topMatch.lost.location} · Lost</p>
                  </div>

                  <span className="status">Lost</span>
                </div>

                <div className="match-card">
                  <div className="match-icon">✦</div>

                  <div>
                    <strong>Possible Match Found!</strong>
                    <p>Based on report similarity</p>
                  </div>

                  <div className="match-score">{topMatch.score}%</div>
                </div>

                <div className="visual-card found-card">
                  <div className="visual-icon">
                    {getItemIcon(topMatch.found.category)}
                  </div>

                  <div>
                    <h3>{topMatch.found.name}</h3>
                    <p>{topMatch.found.location} · Found</p>
                  </div>

                  <span className="found-status">Found</span>
                </div>
              </>
            ) : (
              <>
                {lostItems.length > 0 && (
                  <div className="visual-card">
                    <div className="visual-icon">
                      {getItemIcon(lostItems[0].category)}
                    </div>

                    <div>
                      <h3>{lostItems[0].name}</h3>
                      <p>{lostItems[0].location} · Lost</p>
                    </div>

                    <span className="status">Lost</span>
                  </div>
                )}

                <div className="match-card">
                  <div className="match-icon">✦</div>

                  <div>
                    <strong>
                      {lostItems.length > 0 && foundItems.length > 0
                        ? 'No Strong Match Yet'
                        : 'Smart Matching Ready'}
                    </strong>

                    <p>
                      {lostItems.length > 0 && foundItems.length > 0
                        ? 'We will show possible matches when the similarity is sufficient.'
                        : 'Submit Lost and Found reports to discover possible matches.'}
                    </p>
                  </div>
                </div>

                {foundItems.length > 0 && (
                  <div className="visual-card found-card">
                    <div className="visual-icon">
                      {getItemIcon(foundItems[0].category)}
                    </div>

                    <div>
                      <h3>{foundItems[0].name}</h3>
                      <p>{foundItems[0].location} · Found</p>
                    </div>

                    <span className="found-status">Found</span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="stats">
          <div>
            <h2>{items.length}</h2>
            <p>Reports Submitted</p>
          </div>

          <div>
            <h2>{lostItems.length}</h2>
            <p>Lost Reports</p>
          </div>

          <div>
            <h2>{foundItems.length}</h2>
            <p>Found Reports</p>
          </div>

          <div>
            <h2>{matches.length}</h2>
            <p>Possible Matches</p>
          </div>
        </section>

        <section className="smart-matches" id="matches">
          <div className="reports-heading">
            <div>
              <span className="section-tag">INTELLIGENT MATCHING</span>
              <h2>AI-Powered Match Results</h2>
              <p>
                Our matching engine compares lost and found reports
                to identify possible matches.
              </p>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="empty-reports">
              <span>🔎</span>
              <h3>No Matches Found Yet</h3>
              <p>
                Submit both Lost and Found reports to discover
                possible matches.
              </p>
            </div>
          ) : (
            <div className="match-results-grid">
              {matches.map((match) => (
                <div
                  className="match-result-card"
                  key={`${match.lost.id}-${match.found.id}`}
                >
                  <div className="match-result-heading">
                    <span>✦ Possible Match</span>
                    <strong>{match.score}% Match</strong>
                  </div>

                  <div className="match-item">
                    <span className="lost-label">LOST ITEM</span>

                    {match.lost.image && (
                      <img
                        src={match.lost.image}
                        alt={match.lost.name}
                        className="report-image"
                      />
                    )}

                    <h3>{match.lost.name}</h3>
                    <p>Category: {match.lost.category}</p>
                    <p>Location: {match.lost.location}</p>
                    <p>Date: {match.lost.date}</p>
                    <p>{match.lost.description}</p>
                  </div>

                  <div className="match-divider">↕</div>

                  <div className="match-item">
                    <span className="found-label">FOUND ITEM</span>

                    {match.found.image && (
                      <img
                        src={match.found.image}
                        alt={match.found.name}
                        className="report-image"
                      />
                    )}

                    <h3>{match.found.name}</h3>
                    <p>Category: {match.found.category}</p>
                    <p>Location: {match.found.location}</p>
                    <p>Date: {match.found.date}</p>
                    <p>{match.found.description}</p>
                  </div>

                  <div className="match-progress">
                    <div
                      className="match-progress-fill"
                      style={{ width: `${match.score}%` }}
                    />
                  </div>

                  <p className="match-note">
                    This is a possible match based on text similarity.
                    Please verify the item details before claiming it.
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="reports" id="items">
          <div className="reports-heading">
            <div>
              <span className="section-tag">COMMUNITY REPORTS</span>
              <h2>Recently Reported Items</h2>
              <p>Explore the latest lost and found reports.</p>
            </div>

            <input
              className="search-input"
              type="search"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="report-grid">
            {loadingItems ? (
              <div className="empty-reports">
                <h3>Loading reports...</h3>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-reports">
                <span>🔍</span>
                <h3>No reports yet</h3>
                <p>Be the first to report a lost or found item.</p>

                <button className="primary-btn" onClick={() => openForm('Lost')}>
                  Create First Report
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div className="report-card" key={item.id}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="report-image"
                    />
                  )}

                  <span className={item.type === 'Lost' ? 'lost-label' : 'found-label'}>
                    {item.type} Item
                  </span>

                  <h3>{item.name}</h3>
                  <p>Category: {item.category}</p>
                  <p>Location: {item.location}</p>
                  <p>Date: {item.date}</p>
                  <p>{item.description}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="how" id="how-it-works">
          <span className="section-tag">SIMPLE PROCESS</span>
          <h2>Finding lost things, made easier.</h2>
          <p>Three simple steps to bring your belongings back.</p>

          <div className="steps">
            <div className="step-card">
              <span>01</span>
              <h3>Report an Item</h3>
              <p>
                Tell us what you lost or found. Add a description,
                location and optional photo.
              </p>
            </div>

            <div className="step-card">
              <span>02</span>
              <h3>AI Finds Matches</h3>
              <p>
                Our smart matching system compares descriptions
                and identifies possible matches.
              </p>
            </div>

            <div className="step-card">
              <span>03</span>
              <h3>Get It Back</h3>
              <p>
                Connect with the finder or owner and reunite
                with your belongings.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          <span className="logo-icon">F</span>
          FindBack<span className="ai">AI</span>
        </div>

        <p>Making lost things found again. ✨</p>
        <span>© 2026 FindBack AI. All rights reserved.</span>
      </footer>

      {formType && (
        <div className="modal-overlay">
          <div className="report-modal">
            <button
              className="close-modal"
              onClick={() => setFormType(null)}
              type="button"
            >
              ×
            </button>

            <span className="section-tag">ITEM REPORT</span>
            <h2>Report {formType} Item</h2>
            <p>Enter the details below to submit your report.</p>

            <form onSubmit={submitReport}>
              <label>Item Name *</label>

              <input
                required
                placeholder="e.g. Black Backpack"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <label>Category *</label>

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Electronics</option>
                <option>Bags</option>
                <option>Documents</option>
                <option>Clothing</option>
                <option>Accessories</option>
                <option>Books</option>
                <option>Other</option>
              </select>

              <label>Location *</label>

              <input
                required
                placeholder="Where was it lost or found?"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              <label>Date *</label>

              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <label>Description *</label>

              <textarea
                required
                placeholder="Describe the item, colour, brand or other details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <label>Upload Image (Optional)</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  const reader = new FileReader()

                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setForm((previous) => ({
                        ...previous,
                        image: reader.result as string,
                      }))
                    }
                  }

                  reader.readAsDataURL(file)
                }}
              />

              <button
                className="primary-btn submit-report"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : `Submit ${formType} Report`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
