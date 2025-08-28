import React, { useState, useEffect, useMemo } from 'react';
import { MysteryEngine } from '../../engine/mystery/MysteryEngine';
import { getAllClues, getClue, journalClues, systemLogClues, hiddenFileClues, gameOutcomeClues } from '../../data/clues';
import RedHerringInfo from '../../ui/components/RedHerringInfo';
import useRedHerringSystem from '../../ui/hooks/useRedHerringSystem';
import './Guide.css';

/**
 * GUIDE.EXE - Hidden hint system application
 * Provides escalating hints for solving the mystery
 */
export default function GuideWindow() {
  // Get instance of the MysteryEngine
  const [mysteryEngine] = useState(() => MysteryEngine.getInstance());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);

  // Get the discovered clues from the MysteryEngine
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]);

  useEffect(() => {
    // Get discovered clues from MysteryEngine
    setDiscoveredClues(mysteryEngine.getDiscoveredClues());
  }, [mysteryEngine]);

  // Organize clues by category for the sidebar
  const clueCategories = useMemo(() => {
    return {
      journal: {
        name: 'Journal Entries',
        clues: journalClues.filter(clue => discoveredClues.includes(clue.id))
      },
      systemLogs: {
        name: 'System Logs',
        clues: systemLogClues.filter(clue => discoveredClues.includes(clue.id))
      },
      hiddenFiles: {
        name: 'Hidden Files',
        clues: hiddenFileClues.filter(clue => discoveredClues.includes(clue.id))
      },
      gameOutcomes: {
        name: 'Game Outcomes',
        clues: gameOutcomeClues.filter(clue => discoveredClues.includes(clue.id))
      }
    };
  }, [discoveredClues]);

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

  return (
    <div className="guide-window">
      <div className="guide-header">
        <h1>GUIDE.EXE</h1>
        <p>Secret Assistance Protocol v2.5.17</p>
      </div>

      <div className="guide-content">
        <div className="guide-sidebar">
          <h3>Discovered Clues</h3>
          <ul>
            {Object.entries(clueCategories).map(([key, category]) => (
              <React.Fragment key={key}>
                <li 
                  className={selectedCategory === key ? 'selected' : ''}
                  onClick={() => setSelectedCategory(key)}
                >
                  {category.name} ({category.clues.length})
                </li>
                
                {selectedCategory === key && (
                  <ul className="subcategory">
                    {category.clues.map(clue => (
                      <li 
                        key={clue.id}
                        className={selectedClueId === clue.id ? 'selected' : ''}
                        onClick={() => setSelectedClueId(clue.id)}
                      >
                        {clue.title}
                      </li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </ul>

          <h3>Path Analysis</h3>
          <ul>
            <li 
              className={selectedCategory === 'path_alpha' ? 'selected' : ''}
              onClick={() => {
                setSelectedCategory('path_alpha');
                setSelectedClueId(null);
              }}
            >
              Alpha Path (Acceptance)
            </li>
            <li 
              className={selectedCategory === 'path_beta' ? 'selected' : ''}
              onClick={() => {
                setSelectedCategory('path_beta');
                setSelectedClueId(null);
              }}
            >
              Beta Path (Liminal)
            </li>
            <li 
              className={selectedCategory === 'path_gamma' ? 'selected' : ''}
              onClick={() => {
                setSelectedCategory('path_gamma');
                setSelectedClueId(null);
              }}
            >
              Gamma Path (Escape)
            </li>
          </ul>
        </div>

        <div className="guide-detail">
          {selectedClueId && selectedClue ? (
            <div className="clue-details">
              <h2>{selectedClue.title}</h2>
              <div className="hint-level-selector">
                <button 
                  className={hintLevel === 1 ? 'active' : ''}
                  onClick={() => setHintLevel(1)}
                >
                  Subtle Hint
                </button>
                <button 
                  className={hintLevel === 2 ? 'active' : ''}
                  onClick={() => setHintLevel(2)}
                >
                  Clear Guidance
                </button>
                <button 
                  className={hintLevel === 3 ? 'active' : ''}
                  onClick={() => setHintLevel(3)}
                >
                  Explicit Solution
                </button>
              </div>

              <div className="hint-content">
                <p>{getHintForClue(selectedClueId, hintLevel)}</p>
              </div>

              {selectedClue.relatedFiles && selectedClue.relatedFiles.length > 0 && (
                <div className="related-files">
                  <h3>Related Files</h3>
                  <ul>
                    {selectedClue.relatedFiles.map(file => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : selectedCategory?.startsWith('path_') ? (
            <div className="path-details">
              <h2>
                {selectedCategory === 'path_alpha' ? 'Alpha Path (Acceptance)' : 
                 selectedCategory === 'path_beta' ? 'Beta Path (Liminal)' : 
                 'Gamma Path (Escape)'}
              </h2>

              <div className="hint-level-selector">
                <button 
                  className={hintLevel === 1 ? 'active' : ''}
                  onClick={() => setHintLevel(1)}
                >
                  Subtle Hint
                </button>
                <button 
                  className={hintLevel === 2 ? 'active' : ''}
                  onClick={() => setHintLevel(2)}
                >
                  Clear Guidance
                </button>
                <button 
                  className={hintLevel === 3 ? 'active' : ''}
                  onClick={() => setHintLevel(3)}
                >
                  Explicit Solution
                </button>
              </div>

              <div className="hint-content">
                <p>
                  {selectedCategory === 'path_alpha' ? getPathHint('alpha') : 
                   selectedCategory === 'path_beta' ? getPathHint('beta') : 
                   getPathHint('gamma')}
                </p>
              </div>

              <div className="path-progress">
                <h3>Current Progress</h3>
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
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a clue or path from the sidebar for analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
