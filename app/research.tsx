import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/context/GameContext';
import ResourceIcon from '@/components/ui/ResourceIcon';
import colors from '@/utils/colors';
import researchData, { IResearchNode, IResearchCategory, IResearchTree } from '@/data/research';
import ShipStatus from '@/components/ShipStatus';

const { width, height } = Dimensions.get('window');

interface ResearchNodeProps {
  node: IResearchNode;
  category: IResearchCategory;
  onPress: () => void;
  canAfford: boolean;
  canResearch: boolean;
}

const ResearchNodeComponent: React.FC<ResearchNodeProps> = ({
  node,
  category,
  onPress,
  canAfford,
  canResearch,
}) => {
  const getNodeStatus = () => {
    if (node.completed) return 'completed';
    if (node.inProgress) return 'inProgress';
    if (!canResearch) return 'locked';
    if (!canAfford) return 'unaffordable';
    return 'available';
  };

  const status = getNodeStatus();

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'inProgress': return '#FF9800';
      case 'locked': return '#757575';
      case 'unaffordable': return '#F44336';
      case 'available': return category.color;
      default: return '#757575';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'inProgress': return 'hourglass';
      case 'locked': return 'lock-closed';
      case 'unaffordable': return 'close-circle';
      case 'available': return 'play-circle';
      default: return 'help-circle';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.researchNode,
        { 
          borderColor: getStatusColor(),
          backgroundColor: status === 'completed' ? `${getStatusColor()}20` : colors.panelBackground,
          opacity: status === 'locked' ? 0.5 : 1,
        }
      ]}
      onPress={onPress}
      disabled={status === 'locked'}
    >
      <View style={styles.nodeHeader}>
        <Text style={styles.nodeIcon}>{category.icon}</Text>
        <Ionicons 
          name={getStatusIcon() as any} 
          size={16} 
          color={getStatusColor()} 
          style={styles.statusIcon}
        />
      </View>
      
      <Text style={styles.nodeTitle}>{node.title}</Text>
      <Text style={styles.nodeTier}>Tier {node.tier}</Text>
      
      {node.inProgress && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${node.progress}%` }]} />
          <Text style={styles.progressText}>{Math.round(node.progress)}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface ResearchTreeProps {
  tree: IResearchTree;
  category: IResearchCategory;
  localNodes: IResearchNode[];
  onNodePress: (node: IResearchNode) => void;
  canAffordResearch: (node: IResearchNode) => boolean;
  canStartResearch: (node: IResearchNode) => boolean;
}

const ResearchTreeComponent: React.FC<ResearchTreeProps> = ({
  tree,
  category,
  localNodes,
  onNodePress,
  canAffordResearch,
  canStartResearch,
}) => {
  return (
    <View style={styles.treeContainer}>
      <View style={styles.treeHeader}>
        <Text style={styles.treeIcon}>{tree.icon}</Text>
        <View style={styles.treeInfo}>
          <Text style={styles.treeName}>{tree.name}</Text>
          <Text style={styles.treeDescription}>{tree.description}</Text>
        </View>
      </View>
      
      <View style={styles.treeNodes}>
        {tree.nodes.map((node) => {
          const localNode = localNodes.find(n => n.id === node.id) || node;
          return (
            <View key={node.id} style={styles.nodeContainer}>
              <ResearchNodeComponent
                node={localNode}
                category={category}
                onPress={() => onNodePress(localNode)}
                canAfford={canAffordResearch(localNode)}
                canResearch={canStartResearch(localNode)}
              />
              
              {/* Connection line to prerequisites */}
              {localNode.prerequisites.length > 0 && (
                <View style={styles.connectionLine} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface ResearchModalProps {
  visible: boolean;
  node: IResearchNode | null;
  category: IResearchCategory | null;
  onClose: () => void;
  onStartResearch: () => void;
  canAfford: boolean;
  canResearch: boolean;
}

const ResearchModal: React.FC<ResearchModalProps> = ({
  visible,
  node,
  category,
  onClose,
  onStartResearch,
  canAfford,
  canResearch,
}) => {
  const { resources } = useGame();

  if (!node || !category) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[colors.panelBackground, colors.background]}
            style={styles.modalGradient}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalCategoryIcon}>{category.icon}</Text>
                <View>
                  <Text style={styles.modalTitle}>{node.title}</Text>
                  <Text style={styles.modalCategory}>{category.name} • Tier {node.tier}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>{node.description}</Text>

              {/* Research Effects */}
              <View style={styles.effectsContainer}>
                <Text style={styles.sectionTitle}>Research Effects</Text>
                {node.effects.map((effect, index) => (
                  <View key={index} style={styles.effectItem}>
                    <Ionicons 
                      name="star" 
                      size={16} 
                      color={colors.primary} 
                      style={styles.effectIcon}
                    />
                    <Text style={styles.effectText}>{effect.description}</Text>
                  </View>
                ))}
              </View>

              {/* Research Costs */}
              <View style={styles.costsContainer}>
                <Text style={styles.sectionTitle}>Research Costs</Text>
                <View style={styles.costList}>
                  {node.costs.map((cost, index) => (
                    <View key={index} style={styles.costItem}>
                      <ResourceIcon type={cost.resourceType} size={20} />
                      <Text 
                        style={[
                          styles.costAmount,
                          { 
                            color: resources[cost.resourceType].current >= cost.amount 
                              ? colors.textPrimary 
                              : colors.error 
                          }
                        ]}
                      >
                        {cost.amount}
                      </Text>
                      <Text style={styles.costAvailable}>
                        / {resources[cost.resourceType].current}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.durationContainer}>
                <Text style={styles.sectionTitle}>Research Duration</Text>
                <Text style={styles.durationText}>{formatDuration(node.duration)}</Text>
              </View>

              {/* Prerequisites */}
              {node.prerequisites.length > 0 && (
                <View style={styles.prerequisitesContainer}>
                  <Text style={styles.sectionTitle}>Prerequisites</Text>
                  {node.prerequisites.map((prereqId, index) => {
                    const prereqNode = researchData
                      .flatMap(cat => cat.trees)
                      .flatMap(tree => tree.nodes)
                      .find(n => n.id === prereqId);
                    
                    return prereqNode ? (
                      <View key={index} style={styles.prerequisiteItem}>
                                              <Ionicons 
                        name={prereqNode.completed ? "checkmark-circle" : "time"} 
                        size={16} 
                        color={prereqNode.completed ? '#4CAF50' : '#FF9800'} 
                      />
                        <Text style={styles.prerequisiteText}>{prereqNode.title}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              {node.completed ? (
                <View style={styles.completedButton}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.completedButtonText}>Research Completed</Text>
                </View>
              ) : node.inProgress ? (
                <View style={styles.inProgressButton}>
                  <Ionicons name="hourglass" size={20} color={colors.warning} />
                  <Text style={styles.inProgressButtonText}>Research In Progress</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { 
                      backgroundColor: canAfford && canResearch ? colors.primary : colors.disabled,
                      opacity: canAfford && canResearch ? 1 : 0.5
                    }
                  ]}
                  onPress={onStartResearch}
                  disabled={!canAfford || !canResearch}
                >
                  <Ionicons name="play" size={20} color={colors.textPrimary} />
                  <Text style={styles.startButtonText}>Start Research</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const Research: React.FC = () => {
  const { resources, isAchievementUnlocked, showGeneralNotification, updateResources, setMainShip, updateAchievToCompleted, showNotification, achievements } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('materials');
  const [selectedNode, setSelectedNode] = useState<IResearchNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [localResearchNodes, setLocalResearchNodes] = useState<IResearchNode[]>(
    researchData.flatMap(category => category.trees).flatMap(tree => tree.nodes)
  );
  const [activeResearch, setActiveResearch] = useState<string | null>(null);
  const [researchTimer, setResearchTimer] = useState<number>(0);

  // Check if research is unlocked
  const isResearchUnlocked = isAchievementUnlocked('unlock_research_lab');

  const selectedCategoryData = researchData.find(cat => cat.id === selectedCategory);

  // Research timer effect
  useEffect(() => {
    if (activeResearch && researchTimer > 0) {
      const interval = setInterval(() => {
        setResearchTimer(prev => {
          const newTimer = prev - 1;
          
          // Update progress
          const node = localResearchNodes.find(n => n.id === activeResearch);
          if (node) {
            const progress = ((node.duration - newTimer) / node.duration) * 100;
            setLocalResearchNodes(prevNodes => 
              prevNodes.map(n => 
                n.id === activeResearch 
                  ? { ...n, progress: Math.min(100, progress) }
                  : n
              )
            );
          }
          
          // Complete research when timer reaches 0
          if (newTimer <= 0) {
            completeResearch(activeResearch);
            return 0;
          }
          
          return newTimer;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeResearch, researchTimer]);

  const completeResearch = (nodeId: string) => {
    const node = localResearchNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Apply research effects
    node.effects.forEach(effect => {
      switch (effect.type) {
        case 'passive_efficiency':
          if (effect.target && effect.value) {
            if (effect.target === 'all_materials') {
              // Apply to all material resources
              setMainShip(prev => {
                const updatedResources = { ...prev.resources };
                ['alloys', 'solarPlasma', 'darkMatter', 'frozenHydrogen', 'exoticMatter'].forEach(key => {
                  const resourceKey = key as keyof typeof updatedResources;
                  updatedResources[resourceKey] = {
                    ...updatedResources[resourceKey],
                    efficiency: updatedResources[resourceKey].efficiency * effect.value!
                  };
                });
                return { ...prev, resources: updatedResources };
              });
            } else {
              // Apply to specific resource
              const resourceKey = effect.target as keyof typeof resources;
              if (resources[resourceKey]) {
                setMainShip(prev => ({
                  ...prev,
                  resources: {
                    ...prev.resources,
                    [resourceKey]: {
                      ...prev.resources[resourceKey],
                      efficiency: prev.resources[resourceKey].efficiency * effect.value!
                    }
                  }
                }));
              }
            }
          }
          break;
          
        case 'increase_capacity':
          if (effect.target && effect.value) {
            if (effect.target === 'all_resources') {
              // Apply to all resources
              setMainShip(prev => {
                const updatedResources = { ...prev.resources };
                Object.keys(updatedResources).forEach(key => {
                  const resourceKey = key as keyof typeof updatedResources;
                  updatedResources[resourceKey] = {
                    ...updatedResources[resourceKey],
                    max: updatedResources[resourceKey].max + effect.value!
                  };
                });
                return { ...prev, resources: updatedResources };
              });
            } else {
              // Apply to specific resource or ship property
              const resourceKey = effect.target as keyof typeof resources;
              if (resources[resourceKey]) {
                setMainShip(prev => ({
                  ...prev,
                  resources: {
                    ...prev.resources,
                    [resourceKey]: {
                      ...prev.resources[resourceKey],
                      max: prev.resources[resourceKey].max + effect.value!
                    }
                  }
                }));
              }
            }
          }
          break;
          
        case 'unlock_slot':
          if (effect.target === 'weapon_slots' && effect.value) {
            setMainShip(prev => ({
              ...prev,
              maxWeaponSlots: prev.maxWeaponSlots + effect.value!
            }));
          }
          break;
          
        case 'automation':
          if (effect.target === 'basic_mining' && effect.value) {
            // Basic automation gives passive resource income
            showGeneralNotification({
              title: "Mining Automation Active! ⚙️",
              message: "Your mining operations are now partially automated. You'll earn small amounts of resources passively.",
              type: "info",
              icon: "🤖"
            });
            
            // Start passive resource generation
            const passiveIncome = setInterval(() => {
              updateResources('energy', {
                current: Math.min(resources.energy.current + 5, resources.energy.max)
              });
              updateResources('alloys', {
                current: Math.min(resources.alloys.current + 2, resources.alloys.max)
              });
            }, 30000); // Every 30 seconds
            
            // Store interval reference for cleanup (in a real app, you'd want to manage this better)
            (window as any).automationInterval = passiveIncome;
          }
          break;
          
        case 'weapon_damage':
        case 'weapon_speed':
        case 'weapon_energy':
          // These would be applied when weapons are used in combat
          // For now, we'll just show a notification
          showGeneralNotification({
            title: "Weapon Enhancement! ⚔️",
            message: `${effect.target} weapons have been improved: ${effect.description}`,
            type: "info",
            icon: "🔧"
          });
          break;
          
        case 'unlock_weapon':
        case 'unlock_feature':
          // Show notification about unlocked content
          showGeneralNotification({
            title: "New Technology Unlocked! 🚀",
            message: effect.description,
            type: "info",
            icon: "🔓"
          });
          break;
      }
    });

    // Mark research as completed
    setLocalResearchNodes(prev => prev.map(n => 
      n.id === nodeId 
        ? { ...n, completed: true, inProgress: false, progress: 100 }
        : n
    ));
    setActiveResearch(null);
    setResearchTimer(0);

    // Check if this is the first research completed
    const firstResearchCompleted = !isAchievementUnlocked("complete_first_research");
    
    if (firstResearchCompleted) {
      // Complete the "complete_first_research" achievement
      updateAchievToCompleted("complete_first_research");
      const achievement = achievements.find((ach) => ach.id === "complete_first_research");
      if (achievement) {
        showNotification({
          title: achievement.title,
          description: achievement.story,
          rewards: [],
          type: 'achievement',
        });
      }
    }

    showGeneralNotification({
      title: "Research Complete! 🎉",
      message: `${node.title} research has been completed! ${node.effects.map(e => e.description).join(', ')}`,
      type: "success",
      icon: "✅"
    });
  };

  const canAffordResearch = (node: IResearchNode): boolean => {
    return node.costs.every(cost => 
      resources[cost.resourceType].current >= cost.amount
    );
  };

  const canStartResearch = (node: IResearchNode): boolean => {
    if (node.completed || node.inProgress) return false;
    
    // Check prerequisites using local research nodes
    if (node.prerequisites && node.prerequisites.length > 0) {
      return node.prerequisites.every(prereqId => {
        const prereqNode = localResearchNodes.find(n => n.id === prereqId);
        return prereqNode?.completed || false;
      });
    }
    
    return true;
  };

  const handleNodePress = (node: IResearchNode) => {
    setSelectedNode(node);
    setModalVisible(true);
  };

  const handleStartResearch = () => {
    if (selectedNode && canAffordResearch(selectedNode) && canStartResearch(selectedNode)) {
      // Deduct resources
      selectedNode.costs.forEach(cost => {
        updateResources(cost.resourceType, {
          current: resources[cost.resourceType].current - cost.amount
        });
      });

      // Start research
      setLocalResearchNodes(prev => prev.map(n => 
        n.id === selectedNode.id 
          ? { ...n, inProgress: true, progress: 0 }
          : n
      ));
      
      setActiveResearch(selectedNode.id);
      setResearchTimer(selectedNode.duration);

      showGeneralNotification({
        title: "Research Started! 🔬",
        message: `${selectedNode.title} research has begun in your laboratory. It will take ${Math.floor(selectedNode.duration / 60)} minutes to complete.`,
        type: "info",
        icon: "⚗️"
      });
      
      setModalVisible(false);
    }
  };

  if (!isResearchUnlocked) {
    return (
      <>
        <LinearGradient
          colors={[colors.background, colors.panelBackground]}
          style={styles.container}
        >
          <View style={styles.lockedContainer}>
            <Ionicons name="lock-closed" size={80} color={colors.textSecondary} />
            <Text style={styles.lockedTitle}>Research Laboratory Required</Text>
            <Text style={styles.lockedDescription}>
              Establish a Research Laboratory to unlock the advanced research tree system. Gather the required resources to begin your technological advancement.
            </Text>
          </View>
        </LinearGradient>
        <ShipStatus />
      </>
    );
  }

  return (
    <>
      <LinearGradient
        colors={[colors.background, colors.panelBackground]}
        style={styles.container}
      >
        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {researchData.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && [
                    styles.selectedCategoryTab,
                    { borderBottomColor: category.color }
                  ]
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text 
                  style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.selectedCategoryName
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Research Trees */}
        {selectedCategoryData && (
          <ScrollView style={styles.researchTree} showsVerticalScrollIndicator={false}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{selectedCategoryData.name}</Text>
              <Text style={styles.categoryDescription}>{selectedCategoryData.description}</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.treesContainer}
              contentContainerStyle={styles.treesContent}
            >
              {selectedCategoryData.trees.map((tree) => (
                <ResearchTreeComponent
                  key={tree.id}
                  tree={tree}
                  category={selectedCategoryData}
                  localNodes={localResearchNodes}
                  onNodePress={handleNodePress}
                  canAffordResearch={canAffordResearch}
                  canStartResearch={canStartResearch}
                />
              ))}
            </ScrollView>
          </ScrollView>
        )}
      </LinearGradient>

      {/* Research Modal */}
      <ResearchModal
        visible={modalVisible}
        node={selectedNode}
        category={selectedCategoryData || null}
        onClose={() => setModalVisible(false)}
        onStartResearch={handleStartResearch}
        canAfford={selectedNode ? canAffordResearch(selectedNode) : false}
        canResearch={selectedNode ? canStartResearch(selectedNode) : false}
      />

      <ShipStatus />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  lockedDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  categoryTabs: {
    backgroundColor: colors.panelBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  selectedCategoryTab: {
    borderBottomWidth: 3,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedCategoryName: {
    color: colors.textPrimary,
  },
  researchTree: {
    flex: 1,
    padding: 16,
  },
  categoryHeader: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  treesContainer: {
    flex: 1,
  },
  treesContent: {
    paddingRight: 20,
  },
  treeContainer: {
    width: 200,
    marginRight: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  treeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  treeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  treeInfo: {
    flex: 1,
  },
  treeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  treeDescription: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 12,
  },
  treeNodes: {
    gap: 8,
  },
  nodeContainer: {
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    top: -8,
    left: '50%',
    width: 2,
    height: 8,
    backgroundColor: colors.border,
    transform: [{ translateX: -1 }],
  },
  researchNode: {
    backgroundColor: colors.panelBackground,
    borderRadius: 6,
    borderWidth: 1,
    padding: 8,
    minHeight: 70,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nodeIcon: {
    fontSize: 16,
  },
  statusIcon: {
    marginLeft: 4,
  },
  nodeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 14,
  },
  nodeTier: {
    fontSize: 9,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  progressContainer: {
    marginTop: 6,
    backgroundColor: colors.background,
    borderRadius: 4,
    height: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 12,
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalCategoryIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  effectsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  effectIcon: {
    marginRight: 8,
  },
  effectText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  costsContainer: {
    marginBottom: 24,
  },
  costList: {
    gap: 8,
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  costAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 4,
  },
  costAvailable: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  durationContainer: {
    marginBottom: 24,
  },
  durationText: {
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  prerequisitesContainer: {
    marginBottom: 24,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
  },
  prerequisiteText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  inProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  inProgressButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});

export default Research; 