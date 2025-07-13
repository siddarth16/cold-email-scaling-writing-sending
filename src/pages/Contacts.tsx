import { useState, useEffect } from 'react'
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
  MoreVertical
} from 'lucide-react'
import { Contact, ContactFilter, useContacts } from '../lib/contacts'
import { ContactImportModal } from '../components/ContactImportModal'
import { toast } from 'react-hot-toast'

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
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
            onClick={handleExport}
            className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="neo-button inline-flex items-center gap-2"
          >
            <Upload size={20} />
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

      <ContactImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  )
} 