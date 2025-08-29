import React, { useState, useEffect, useMemo } from 'react';
import { MysteryEngine } from '../../engine/mystery/MysteryEngine';
import { getAllClues, getClue, journalClues, systemLogClues, hiddenFileClues, gameOutcomeClues, Clue } from '../../data/clues';
import RedHerringInfo from '../../ui/components/RedHerringInfo';
import useRedHerringSystem from '../../ui/hooks/useRedHerringSystem';
import './Guide.css';

/**
 * GUIDE.EXE - Hidden hint system application
 * Provides escalating hints for solving the mystery
 */
interface CategoryCount {
  total: number;
  discovered: number;
}

export default function GuideWindow() {
  // Get instance of the MysteryEngine
  const [mysteryEngine] = useState(() => MysteryEngine.getInstance());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, CategoryCount>>({});

  // Get the discovered clues from the MysteryEngine
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]);

  useEffect(() => {
    // Get discovered clues from MysteryEngine
    const discovered = mysteryEngine.getDiscoveredClues();
    setDiscoveredClues(discovered);
    
    // Update category counts for progress indicators
    setCategoryCounts({
      journal: {
        total: journalClues.length,
        discovered: journalClues.filter(clue => discovered.includes(clue.id)).length
      },
      systemLogs: {
        total: systemLogClues.length,
        discovered: systemLogClues.filter(clue => discovered.includes(clue.id)).length
      },
      hiddenFiles: {
        total: hiddenFileClues.length,
        discovered: hiddenFileClues.filter(clue => discovered.includes(clue.id)).length
      },
      gameOutcomes: {
        total: gameOutcomeClues.length,
        discovered: gameOutcomeClues.filter(clue => discovered.includes(clue.id)).length
      }
    });
  }, [mysteryEngine]);

  // Organize clues by category for the sidebar
  const clueCategories = useMemo(() => {
    // Filter based on search term if it exists
    const filterBySearch = (clues: Clue[]) => {
      if (!searchTerm.trim()) return clues.filter(clue => discoveredClues.includes(clue.id));
      
      return clues.filter(clue => 
        discoveredClues.includes(clue.id) && 
        (clue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (clue.description && clue.description.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    };
    
    return {
      journal: {
        name: 'JOURNAL ENTRIES',
        clues: filterBySearch(journalClues)
      },
      systemLogs: {
        name: 'SYSTEM LOGS',
        clues: filterBySearch(systemLogClues)
      },
      hiddenFiles: {
        name: 'HIDDEN FILES',
        clues: filterBySearch(hiddenFileClues)
      },
      gameOutcomes: {
        name: 'GAME OUTCOMES',
        clues: filterBySearch(gameOutcomeClues)
      }
    };
  }, [discoveredClues, searchTerm]);

  // Get the selected clue
  const selectedClue = useMemo(() => {
    if (!selectedClueId) return null;
    return getClue(selectedClueId);
  }, [selectedClueId]);

  // Generate hints based on clue and hint level
  const getHintForClue = (clueId: string, level: number): string => {
    const clue = getClue(clueId);
    if (!clue) return "No hint available";

    switch (level) {
      case 1:
        // Subtle hint
        return `This clue relates to ${clue.category === 'journal' ? 'personal observations' : 
          clue.category === 'system_log' ? 'system behavior' :
          clue.category === 'hidden_file' ? 'hidden information' :
          clue.category === 'game_outcome' ? 'game achievements' : 'unknown sources'}.`;
      
      case 2:
        // More direct hint
        return `Look for connections between this clue and ${clue.relatedFiles?.[0] || 'related system components'}. The pattern might reveal something about ${clue.title.toLowerCase()}.`;
      
      case 3:
        // Near-explicit solution
        if (clue.requiredClues && clue.requiredClues.length > 0) {
          const reqClue = getClue(clue.requiredClues[0]);
          return `This clue directly builds on "${reqClue?.title || 'previous discoveries'}". The key insight is about ${clue.description.toLowerCase()}. Check ${clue.relatedFiles?.[0] || 'related files'} for more information.`;
        }
        return `The key insight from this clue is: ${clue.description}. This relates directly to the nature of the simulation and MrHeadroom's identity.`;
      
      default:
        return "No hint available";
    }
  };

  // Generate path hints based on the user's current progress
  const getPathHint = (path: 'alpha' | 'beta' | 'gamma'): string => {
    const pathProgress = mysteryEngine.getPathProgress();
    
    switch (path) {
      case 'alpha':
        if (pathProgress.alpha < 30) {
          return "The system wants you to accept it. Look for clues about the nature of reality.";
        } else if (pathProgress.alpha < 70) {
          return "Consider what it means to accept your situation. The terminal may offer commands for acceptance.";
        } else {
          return "Try using the ACCEPT_PARAMETERS command in the terminal. This path represents acceptance of the simulation.";
        }
      
      case 'beta':
        if (pathProgress.beta < 30) {
          return "There may be a middle path between acceptance and escape. Look for system access points.";
        } else if (pathProgress.beta < 70) {
          return "The system has administrative areas you haven't fully accessed. Look for credentials in the game logs.";
        } else {
          return "Try using the PARTIAL_BREAKOUT command in the terminal after finding admin credentials. This represents partial awareness.";
        }
      
      case 'gamma':
        if (pathProgress.gamma < 30) {
          return "Complete freedom may be possible. Look for references to maintenance windows and security exploits.";
        } else if (pathProgress.gamma < 70) {
          return "The maintenance window opens at a specific time. The code 2517 appears in multiple places for a reason.";
        } else {
          return "Set the system time to 02:00, use EXECUTE_BREAKOUT during the maintenance window, and follow the sequence in the escape instructions.";
        }
      
      default:
        return "No path hint available";
    }
  };

  // Calculate total progress 
  const totalProgress = useMemo(() => {
    const pathProgress = mysteryEngine.getPathProgress();
    return Math.max(pathProgress.alpha, pathProgress.beta, pathProgress.gamma);
  }, [mysteryEngine]);

  // Toggle search visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm("");
    }
  };

  return (
    <div className="guide-window">
      <div className="guide-header">
        <div className="guide-header-top">
          <h1>GUIDE.EXE</h1>
          <div className="guide-controls">
            <button 
              className={`search-toggle ${showSearch ? 'active' : ''}`} 
              onClick={toggleSearch}
              title="Search Clues"
            >
              <span>⌕</span>
            </button>
          </div>
        </div>
        <div className="guide-subheader">
          <p>Secret Assistance Protocol v2.5.17</p>
          <div className="overall-progress">
            <span>SYSTEM AWARENESS: {totalProgress}%</span>
            <div className="total-progress-bar">
              <div 
                className="total-progress-fill"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {showSearch && (
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH CLUES..."
              className="search-input"
              autoFocus
            />
            {searchTerm && (
              <button 
                className="search-clear" 
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      <div className="guide-content">
        <div className="guide-sidebar">
          <div className="sidebar-section">
            <div className="section-header">
              <h3>DISCOVERED CLUES</h3>
              <div className="section-stats">
                {discoveredClues.length}/{getAllClues().length}
              </div>
            </div>
            <ul className="category-list">
              {Object.entries(clueCategories).map(([key, category]) => (
                <React.Fragment key={key}>
                  <li 
                    className={`category-item ${selectedCategory === key ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(key)}
                  >
                    <div className="category-label">
                      <span className="category-icon">{
                        key === 'journal' ? '📓' :
                        key === 'systemLogs' ? '📊' :
                        key === 'hiddenFiles' ? '🔒' :
                        '🎮'
                      }</span>
                      <span className="category-name">{category.name}</span>
                    </div>
                    <div className="category-count">
                      <span>{category.clues.length}</span>
                      {categoryCounts[key] && (
                        <div className="mini-progress">
                          <div className="mini-bar" 
                            style={{width: `${(category.clues.length / categoryCounts[key].total) * 100}%`}}
                          ></div>
                        </div>
                      )}
                    </div>
                  </li>
                  
                  {selectedCategory === key && (
                    <ul className="subcategory">
                      {category.clues.map((clue: Clue) => (
                        <li 
                          key={clue.id}
                          className={`clue-item ${selectedClueId === clue.id ? 'selected' : ''} ${clue.isRedHerring ? 'red-herring' : ''}`}
                          onClick={() => setSelectedClueId(clue.id)}
                        >
                          <span className="clue-title">
                            {clue.isRedHerring && <span className="red-herring-icon" title="Potential Red Herring">❓</span>}
                            {clue.title}
                          </span>
                        </li>
                      ))}
                      {category.clues.length === 0 && (
                        <li className="empty-category">
                          {searchTerm ? 'No matching clues' : 'No clues discovered yet'}
                        </li>
                      )}
                    </ul>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <h3>PATH ANALYSIS</h3>
            </div>
            <ul className="path-list">
              <li 
                className={`path-item path-alpha ${selectedCategory === 'path_alpha' ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCategory('path_alpha');
                  setSelectedClueId(null);
                }}
              >
                <div className="path-label">
                  <span className="path-icon">α</span>
                  <span className="path-name">ACCEPTANCE</span>
                </div>
                <div className="path-progress-mini">
                  <span>{mysteryEngine.getPathProgress().alpha}%</span>
                </div>
              </li>
              <li 
                className={`path-item path-beta ${selectedCategory === 'path_beta' ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCategory('path_beta');
                  setSelectedClueId(null);
                }}
              >
                <div className="path-label">
                  <span className="path-icon">β</span>
                  <span className="path-name">LIMINAL</span>
                </div>
                <div className="path-progress-mini">
                  <span>{mysteryEngine.getPathProgress().beta}%</span>
                </div>
              </li>
              <li 
                className={`path-item path-gamma ${selectedCategory === 'path_gamma' ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCategory('path_gamma');
                  setSelectedClueId(null);
                }}
              >
                <div className="path-label">
                  <span className="path-icon">γ</span>
                  <span className="path-name">ESCAPE</span>
                </div>
                <div className="path-progress-mini">
                  <span>{mysteryEngine.getPathProgress().gamma}%</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="guide-detail">
          {selectedClueId && selectedClue ? (
            <div className="clue-details">
              <div className="detail-header">
                <h2>{selectedClue.title}</h2>
                {selectedClue.isRedHerring && (
                  <div className="red-herring-badge" title="Potential Red Herring">
                    <span>VALIDITY UNCERTAIN</span>
                  </div>
                )}
              </div>
              
              <div className="hint-level-selector">
                <button 
                  className={`hint-level-btn level-1 ${hintLevel === 1 ? 'active' : ''}`}
                  onClick={() => setHintLevel(1)}
                >
                  <span className="level-icon">1</span>
                  <span className="level-label">SUBTLE</span>
                </button>
                <button 
                  className={`hint-level-btn level-2 ${hintLevel === 2 ? 'active' : ''}`}
                  onClick={() => setHintLevel(2)}
                >
                  <span className="level-icon">2</span>
                  <span className="level-label">CLEAR</span>
                </button>
                <button 
                  className={`hint-level-btn level-3 ${hintLevel === 3 ? 'active' : ''}`}
                  onClick={() => setHintLevel(3)}
                >
                  <span className="level-icon">3</span>
                  <span className="level-label">EXPLICIT</span>
                </button>
              </div>

              <div className="hint-content">
                <div className="hint-prefix">
                  <span className="hint-level-indicator">HINT LEVEL {hintLevel}</span>
                </div>
                <p>{getHintForClue(selectedClueId, hintLevel)}</p>
              </div>

              {selectedClue.relatedFiles && selectedClue.relatedFiles.length > 0 && (
                <div className="related-files">
                  <h3>RELATED FILES</h3>
                  <ul className="file-list">
                    {selectedClue.relatedFiles.map(file => (
                      <li key={file} className="file-item">
                        <span className="file-icon">📄</span>
                        <span className="file-path">{file}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedClue.requiredClues && selectedClue.requiredClues.length > 0 && (
                <div className="related-clues">
                  <h3>LINKED CLUES</h3>
                  <ul className="related-clue-list">
                    {selectedClue.requiredClues.map(clueId => {
                      const relatedClue = getClue(clueId);
                      return relatedClue ? (
                        <li 
                          key={clueId} 
                          className={`related-clue ${discoveredClues.includes(clueId) ? 'discovered' : 'undiscovered'}`}
                          onClick={() => {
                            if (discoveredClues.includes(clueId)) {
                              setSelectedClueId(clueId);
                            }
                          }}
                        >
                          <span className="clue-status-icon">
                            {discoveredClues.includes(clueId) ? '✓' : '?'}
                          </span>
                          <span className="clue-title">
                            {discoveredClues.includes(clueId) ? relatedClue.title : 'Unknown Clue'}
                          </span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : selectedCategory?.startsWith('path_') ? (
            <div className="path-details">
              <div className="path-header">
                <div className="path-icon-large">
                  {selectedCategory === 'path_alpha' ? 'α' : 
                   selectedCategory === 'path_beta' ? 'β' : 'γ'}
                </div>
                <h2>
                  {selectedCategory === 'path_alpha' ? 'ALPHA PATH: ACCEPTANCE' : 
                   selectedCategory === 'path_beta' ? 'BETA PATH: LIMINAL' : 
                   'GAMMA PATH: ESCAPE'}
                </h2>
              </div>

              <div className="path-progress-section">
                <h3>CURRENT PROGRESS</h3>
                <div className="progress-value">
                  {selectedCategory === 'path_alpha' ? 
                    mysteryEngine.getPathProgress().alpha : 
                    selectedCategory === 'path_beta' ? 
                    mysteryEngine.getPathProgress().beta : 
                    mysteryEngine.getPathProgress().gamma}%
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${selectedCategory === 'path_alpha' ? 
                        mysteryEngine.getPathProgress().alpha : 
                        selectedCategory === 'path_beta' ? 
                        mysteryEngine.getPathProgress().beta : 
                        mysteryEngine.getPathProgress().gamma}%`,
                      backgroundColor: selectedCategory === 'path_alpha' ? 
                        'var(--accent-alpha)' : 
                        selectedCategory === 'path_beta' ? 
                        'var(--accent-beta)' : 
                        'var(--accent-gamma)'
                    }}
                  ></div>
                </div>
                <div className="progress-markers">
                  <div className="marker" style={{left: '25%'}}>
                    <div className="marker-dot"></div>
                    <span>STAGE 1</span>
                  </div>
                  <div className="marker" style={{left: '50%'}}>
                    <div className="marker-dot"></div>
                    <span>STAGE 2</span>
                  </div>
                  <div className="marker" style={{left: '75%'}}>
                    <div className="marker-dot"></div>
                    <span>STAGE 3</span>
                  </div>
                  <div className="marker" style={{left: '100%'}}>
                    <div className="marker-dot"></div>
                    <span>COMPLETE</span>
                  </div>
                </div>
              </div>

              <div className="hint-level-selector">
                <button 
                  className={`hint-level-btn level-1 ${hintLevel === 1 ? 'active' : ''}`}
                  onClick={() => setHintLevel(1)}
                >
                  <span className="level-icon">1</span>
                  <span className="level-label">SUBTLE</span>
                </button>
                <button 
                  className={`hint-level-btn level-2 ${hintLevel === 2 ? 'active' : ''}`}
                  onClick={() => setHintLevel(2)}
                >
                  <span className="level-icon">2</span>
                  <span className="level-label">CLEAR</span>
                </button>
                <button 
                  className={`hint-level-btn level-3 ${hintLevel === 3 ? 'active' : ''}`}
                  onClick={() => setHintLevel(3)}
                >
                  <span className="level-icon">3</span>
                  <span className="level-label">EXPLICIT</span>
                </button>
              </div>

              <div className="hint-content">
                <div className="hint-prefix">
                  <span className="hint-level-indicator">HINT LEVEL {hintLevel}</span>
                </div>
                <p>
                  {selectedCategory === 'path_alpha' ? getPathHint('alpha') : 
                   selectedCategory === 'path_beta' ? getPathHint('beta') : 
                   getPathHint('gamma')}
                </p>
              </div>

              <div className="path-requirements">
                <h3>PATH REQUIREMENTS</h3>
                <ul className="requirement-list">
                  {selectedCategory === 'path_alpha' && (
                    <>
                      <li className={mysteryEngine.getPathProgress().alpha > 30 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().alpha > 30 ? '✓' : '○'}</span>
                        <span className="req-text">Discover the nature of reality files</span>
                      </li>
                      <li className={mysteryEngine.getPathProgress().alpha > 70 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().alpha > 70 ? '✓' : '○'}</span>
                        <span className="req-text">Find terminal acceptance commands</span>
                      </li>
                      <li className={mysteryEngine.getPathProgress().alpha === 100 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().alpha === 100 ? '✓' : '○'}</span>
                        <span className="req-text">Execute ACCEPT_PARAMETERS command</span>
                      </li>
                    </>
                  )}
                  
                  {selectedCategory === 'path_beta' && (
                    <>
                      <li className={mysteryEngine.getPathProgress().beta > 30 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().beta > 30 ? '✓' : '○'}</span>
                        <span className="req-text">Find system access points</span>
                      </li>
                      <li className={mysteryEngine.getPathProgress().beta > 70 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().beta > 70 ? '✓' : '○'}</span>
                        <span className="req-text">Discover admin credentials</span>
                      </li>
                      <li className={mysteryEngine.getPathProgress().beta === 100 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().beta === 100 ? '✓' : '○'}</span>
                        <span className="req-text">Execute PARTIAL_BREAKOUT command</span>
                      </li>
                    </>
                  )}
                  
                  {selectedCategory === 'path_gamma' && (
                    <>
                      <li className={mysteryEngine.getPathProgress().gamma > 30 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().gamma > 30 ? '✓' : '○'}</span>
                        <span className="req-text">Discover maintenance windows and security exploits</span>
                      </li>
                      <li className={mysteryEngine.getPathProgress().gamma > 70 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().gamma > 70 ? '✓' : '○'}</span>
                        <span className="req-text">Find the maintenance time code (2517)</span>
                      </li>
                      <li className={mysteryEngine.getPathProgress().gamma === 100 ? 'completed' : ''}>
                        <span className="req-status">{mysteryEngine.getPathProgress().gamma === 100 ? '✓' : '○'}</span>
                        <span className="req-text">Execute EXECUTE_BREAKOUT command during maintenance</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="welcome-screen">
                <h2>GUIDE ASSISTANCE PROTOCOL</h2>
                <div className="system-logo">G.A.P</div>
                <p>Select a discovered clue or path from the sidebar for detailed analysis</p>
                <div className="instruction-list">
                  <div className="instruction">
                    <span className="instruction-icon">🔍</span>
                    <span className="instruction-text">Review discovered clues</span>
                  </div>
                  <div className="instruction">
                    <span className="instruction-icon">🔄</span>
                    <span className="instruction-text">Track your progress on different paths</span>
                  </div>
                  <div className="instruction">
                    <span className="instruction-icon">💡</span>
                    <span className="instruction-text">Receive hints at various difficulty levels</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
