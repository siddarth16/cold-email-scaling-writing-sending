import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Upload, 
  Download,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  X,
  Mail,
  Phone,
  Building,
  Tag,
  MoreVertical,
  ChevronDown,
  Check
} from 'lucide-react'
import { Contact, ContactFilter, useContacts } from '../lib/contacts'
import { ContactImportModal } from '../components/ContactImportModal'
import { toast } from 'react-hot-toast'

// Mobile-Optimized Country Dropdown Component
function MobileCountryDropdown({ 
  value, 
  onChange, 
  countries 
}: {
  value: string
  onChange: (value: string) => void
  countries: Array<{ code: string; country: string; name: string }>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedCountry = countries.find(country => country.code === value)

  // Click outside handler for mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      // Prevent background scroll on mobile when dropdown is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleDropdown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleCountrySelect = (countryCode: string) => {
    onChange(countryCode)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        onTouchEnd={toggleDropdown}
        className="neo-input w-28 text-center flex items-center justify-between
                 touch-manipulation active:scale-95 transition-transform"
      >
        <span className="truncate text-xs">
          {selectedCountry ? `${selectedCountry.code} ${selectedCountry.country}` : '+1 US'}
        </span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ml-1 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <>
          {/* Mobile backdrop overlay */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] md:hidden" />
          
          {/* Dropdown menu */}
          <div className={`
            absolute z-[9999] w-56 mt-1 bg-gray-800/98 backdrop-blur-md border border-white/20 
            rounded-lg shadow-2xl max-h-60 overflow-auto left-0
            md:bg-gray-800/95 md:border-white/10
            ${isOpen ? 'animate-in fade-in-0 zoom-in-95 duration-200' : ''}
          `}>
            {countries.map((country, index) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country.code)}
                onTouchEnd={() => handleCountrySelect(country.code)}
                className={`
                  w-full px-3 py-2 text-left text-white/90 hover:bg-white/15 active:bg-white/20
                  transition-colors duration-200 touch-manipulation text-sm
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === countries.length - 1 ? 'rounded-b-lg' : ''}
                  flex items-center justify-between
                  ${value === country.code ? 'bg-primary-500/20 text-primary-400' : ''}
                `}
              >
                <div>
                  <div className="font-medium">{country.code} {country.country}</div>
                  <div className="text-xs text-white/60">{country.name}</div>
                </div>
                {value === country.code && (
                  <Check size={14} className="text-primary-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Common country codes for phone numbers
const countryCodes = [
  { code: '+1', country: 'US/CA', name: 'United States/Canada' },
  { code: '+44', country: 'UK', name: 'United Kingdom' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+39', country: 'IT', name: 'Italy' },
  { code: '+34', country: 'ES', name: 'Spain' },
  { code: '+31', country: 'NL', name: 'Netherlands' },
  { code: '+46', country: 'SE', name: 'Sweden' },
  { code: '+47', country: 'NO', name: 'Norway' },
  { code: '+45', country: 'DK', name: 'Denmark' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+64', country: 'NZ', name: 'New Zealand' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+55', country: 'BR', name: 'Brazil' },
  { code: '+52', country: 'MX', name: 'Mexico' },
  { code: '+7', country: 'RU', name: 'Russia' },
  { code: '+27', country: 'ZA', name: 'South Africa' }
]

// Add Contact Modal Component
function AddContactModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean
  onClose: () => void
  onAdd: (contact: Partial<Contact>) => void 
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    position: '',
    countryCode: '+1',
    phone: '',
    industry: '',
    location: '',
    tags: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    const contactData = {
      ...formData,
      phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : '',
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    onAdd(contactData)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      position: '',
      countryCode: '+1',
      phone: '',
      industry: '',
      location: '',
      tags: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800/95 backdrop-blur-md border border-white/10 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Add New Contact</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="neo-input"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="neo-input"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="neo-input"
              placeholder="john.doe@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="neo-input"
                placeholder="Company Inc."
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="neo-input"
                placeholder="CEO"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <MobileCountryDropdown
                value={formData.countryCode}
                onChange={(value) => setFormData({ ...formData, countryCode: value })}
                countries={countryCodes}
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="neo-input flex-1"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="neo-input"
                placeholder="Technology"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="neo-input"
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="neo-input"
              placeholder="lead, interested, high-priority"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="neo-button flex-1"
            >
              Add Contact
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<ContactFilter>({
    search: '',
    tags: [],
    company: ''
  })

  const contactManager = useContacts()

  useEffect(() => {
    const updateContacts = (newContacts: Contact[]) => {
      setContacts(newContacts)
    }

    const unsubscribe = contactManager.subscribe(updateContacts)
    updateContacts(contactManager.getAllContacts())

    return unsubscribe
  }, [contactManager])

  useEffect(() => {
    const filtered = contactManager.filterContacts(filter)
    setFilteredContacts(filtered)
  }, [contacts, filter, contactManager])

  const handleExport = () => {
    const csv = contactManager.exportToCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Contacts exported successfully')
  }

  const handleDeleteSelected = () => {
    if (selectedContacts.length === 0) return
    
    const deletedCount = contactManager.bulkDelete(selectedContacts)
    setSelectedContacts([])
    toast.success(`Deleted ${deletedCount} contacts`)
  }

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id))
    }
  }

  const handleSelectContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    )
  }

  const stats = contactManager.getStats()
  const allTags = contactManager.getAllTags()
  const allCompanies = contactManager.getAllCompanies()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <p className="text-white/70 mt-1">Manage your contact database</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="neo-button inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Contact
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Upload size={16} />
            Import CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="neo-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Contacts</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="neo-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Companies</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.companies}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
              <Building size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="neo-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Tags</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.tags}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Tag size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="neo-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Duplicates</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.duplicates}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="neo-card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-white/40" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="neo-input pl-10"
            />
          </div>
          
          <select
            value={filter.company}
            onChange={(e) => setFilter({ ...filter, company: e.target.value })}
            className="neo-input md:w-48"
          >
            <option value="">All Companies</option>
            {allCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-white/60" />
            <span className="text-white/60 text-sm">
              {filteredContacts.length} of {contacts.length} contacts
            </span>
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  const newTags = filter.tags.includes(tag)
                    ? filter.tags.filter(t => t !== tag)
                    : [...filter.tags, tag]
                  setFilter({ ...filter, tags: newTags })
                }}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  filter.tags.includes(tag)
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:border-white/20'
                }`}
              >
                {tag}
              </button>
            ))}
            {filter.tags.length > 0 && (
              <button
                onClick={() => setFilter({ ...filter, tags: [] })}
                className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Contact Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="neo-card p-6"
      >
        {selectedContacts.length > 0 && (
          <div className="mb-4 flex items-center justify-between p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
            <span className="text-primary-400">
              {selectedContacts.length} contacts selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-1"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        )}

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {contacts.length === 0 ? 'No contacts yet' : 'No contacts found'}
            </h3>
            <p className="text-white/70 mb-6">
              {contacts.length === 0 
                ? 'Import your first contacts to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {contacts.length === 0 && (
              <button
                onClick={() => setShowImportModal(true)}
                className="neo-button inline-flex items-center gap-2"
              >
                <Upload size={20} />
                Import Contacts
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === filteredContacts.length}
                      onChange={handleSelectAll}
                      className="rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Position</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Tags</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white/70">
                      {contact.company || '-'}
                    </td>
                    <td className="py-3 px-4 text-white/70">
                      {contact.position || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <Mail size={16} />
                        {contact.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toast('Edit functionality coming soon')}
                          className="p-1 text-white/60 hover:text-white transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            contactManager.deleteContact(contact.id)
                            toast.success('Contact deleted')
                          }}
                          className="p-1 text-white/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(contactData) => {
          const newContact = contactManager.addContact({
            firstName: contactData.firstName!,
            lastName: contactData.lastName!,
            email: contactData.email!,
            company: contactData.company || '',
            position: contactData.position || '',
            phone: contactData.phone || '',
            industry: contactData.industry || '',
            location: contactData.location || '',
            tags: contactData.tags || []
          })
          toast.success('Contact added successfully!')
        }}
      />

      {/* Import Modal */}
      <ContactImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  )
} 