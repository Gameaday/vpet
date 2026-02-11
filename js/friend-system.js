/**
 * Friend System Module
 * Manages friend lists, friend requests, and social interactions
 */

/**
 * Friend Manager
 * Handles friend system operations
 */
class FriendManager {
    constructor() {
        this.friends = [];
        this.pendingRequests = [];
        this.sentRequests = [];
        this.blockedUsers = [];
        this.maxFriends = 50;
        this.loadFriendData();
    }
    
    /**
     * Load friend data from localStorage
     */
    loadFriendData() {
        const saved = localStorage.getItem('friendData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.friends = data.friends || [];
                this.pendingRequests = data.pendingRequests || [];
                this.sentRequests = data.sentRequests || [];
                this.blockedUsers = data.blockedUsers || [];
            } catch (error) {
                console.error('Error loading friend data:', error);
            }
        }
    }
    
    /**
     * Save friend data to localStorage
     */
    saveFriendData() {
        const data = {
            friends: this.friends,
            pendingRequests: this.pendingRequests,
            sentRequests: this.sentRequests,
            blockedUsers: this.blockedUsers
        };
        localStorage.setItem('friendData', JSON.stringify(data));
    }
    
    /**
     * Generate unique friend ID
     * @param {string} username - Username
     * @returns {string} Friend ID
     */
    generateFriendId(username) {
        return `${username}_${Date.now()}`;
    }
    
    /**
     * Send friend request
     * @param {string} username - Target username
     * @param {string} petName - Requester's pet name
     * @returns {Object} Result {success, message}
     */
    sendFriendRequest(username, petName) {
        // Validate username
        if (!username || username.trim().length === 0) {
            return { success: false, message: 'Invalid username' };
        }
        
        // Check if already friends
        if (this.isFriend(username)) {
            return { success: false, message: 'Already friends!' };
        }
        
        // Check if request already sent
        if (this.sentRequests.some(req => req.username === username)) {
            return { success: false, message: 'Request already sent' };
        }
        
        // Check if request already received from this user
        if (this.pendingRequests.some(req => req.username === username)) {
            return { success: false, message: 'This user already sent you a request! Check pending requests.' };
        }
        
        // Check if blocked
        if (this.isBlocked(username)) {
            return { success: false, message: 'Cannot send request to blocked user' };
        }
        
        // Check friend limit
        if (this.friends.length >= this.maxFriends) {
            return { success: false, message: 'Friend list full' };
        }
        
        // Create friend request
        const request = {
            id: this.generateFriendId(username),
            username,
            petName,
            timestamp: Date.now()
        };
        
        this.sentRequests.push(request);
        this.saveFriendData();
        
        return { success: true, message: 'Friend request sent!' };
    }
    
    /**
     * Accept friend request
     * @param {string} requestId - Request ID
     * @returns {Object} Result {success, message}
     */
    acceptFriendRequest(requestId) {
        const requestIndex = this.pendingRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
            return { success: false, message: 'Request not found' };
        }
        
        // Check friend limit
        if (this.friends.length >= this.maxFriends) {
            return { success: false, message: 'Friend list full' };
        }
        
        const request = this.pendingRequests[requestIndex];
        
        // Add to friends
        const friend = {
            id: request.id,
            username: request.username,
            petName: request.petName,
            addedAt: Date.now(),
            lastInteraction: Date.now(),
            giftsSent: 0,
            giftsReceived: 0,
            battlesPlayed: 0
        };
        
        this.friends.push(friend);
        this.pendingRequests.splice(requestIndex, 1);
        this.saveFriendData();
        
        return { success: true, message: `Now friends with ${request.username}!` };
    }
    
    /**
     * Decline friend request
     * @param {string} requestId - Request ID
     * @returns {Object} Result {success, message}
     */
    declineFriendRequest(requestId) {
        const requestIndex = this.pendingRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
            return { success: false, message: 'Request not found' };
        }
        
        this.pendingRequests.splice(requestIndex, 1);
        this.saveFriendData();
        
        return { success: true, message: 'Request declined' };
    }
    
    /**
     * Remove friend
     * @param {string} friendId - Friend ID
     * @returns {Object} Result {success, message}
     */
    removeFriend(friendId) {
        const friendIndex = this.friends.findIndex(f => f.id === friendId);
        
        if (friendIndex === -1) {
            return { success: false, message: 'Friend not found' };
        }
        
        const friend = this.friends[friendIndex];
        this.friends.splice(friendIndex, 1);
        this.saveFriendData();
        
        return { success: true, message: `Removed ${friend.username} from friends` };
    }
    
    /**
     * Block user
     * @param {string} username - Username to block
     * @returns {Object} Result {success, message}
     */
    blockUser(username) {
        if (this.isBlocked(username)) {
            return { success: false, message: 'User already blocked' };
        }
        
        // Remove from friends if exists
        this.friends = this.friends.filter(f => f.username !== username);
        
        // Remove pending requests
        this.pendingRequests = this.pendingRequests.filter(req => req.username !== username);
        this.sentRequests = this.sentRequests.filter(req => req.username !== username);
        
        // Add to blocked list
        this.blockedUsers.push({
            username,
            blockedAt: Date.now()
        });
        
        this.saveFriendData();
        
        return { success: true, message: `Blocked ${username}` };
    }
    
    /**
     * Unblock user
     * @param {string} username - Username to unblock
     * @returns {Object} Result {success, message}
     */
    unblockUser(username) {
        const index = this.blockedUsers.findIndex(u => u.username === username);
        
        if (index === -1) {
            return { success: false, message: 'User not blocked' };
        }
        
        this.blockedUsers.splice(index, 1);
        this.saveFriendData();
        
        return { success: true, message: `Unblocked ${username}` };
    }
    
    /**
     * Check if user is friend
     * @param {string} username - Username
     * @returns {boolean} Is friend
     */
    isFriend(username) {
        return this.friends.some(f => f.username === username);
    }
    
    /**
     * Check if user is blocked
     * @param {string} username - Username
     * @returns {boolean} Is blocked
     */
    isBlocked(username) {
        return this.blockedUsers.some(u => u.username === username);
    }
    
    /**
     * Get friend by ID
     * @param {string} friendId - Friend ID
     * @returns {Object} Friend object
     */
    getFriend(friendId) {
        return this.friends.find(f => f.id === friendId) || null;
    }
    
    /**
     * Get friend by username
     * @param {string} username - Username
     * @returns {Object} Friend object
     */
    getFriendByUsername(username) {
        return this.friends.find(f => f.username === username) || null;
    }
    
    /**
     * Get all friends
     * @returns {Array} Friends array
     */
    getAllFriends() {
        return [...this.friends];
    }
    
    /**
     * Get pending friend requests
     * @returns {Array} Pending requests
     */
    getPendingRequests() {
        return [...this.pendingRequests];
    }
    
    /**
     * Get sent friend requests
     * @returns {Array} Sent requests
     */
    getSentRequests() {
        return [...this.sentRequests];
    }
    
    /**
     * Get blocked users
     * @returns {Array} Blocked users
     */
    getBlockedUsers() {
        return [...this.blockedUsers];
    }
    
    /**
     * Update friend interaction time
     * @param {string} friendId - Friend ID
     */
    updateInteraction(friendId) {
        const friend = this.getFriend(friendId);
        if (friend) {
            friend.lastInteraction = Date.now();
            this.saveFriendData();
        }
    }
    
    /**
     * Increment gift counter
     * @param {string} friendId - Friend ID
     * @param {string} direction - 'sent' or 'received'
     */
    incrementGift(friendId, direction) {
        const friend = this.getFriend(friendId);
        if (friend) {
            if (direction === 'sent') {
                friend.giftsSent++;
            } else if (direction === 'received') {
                friend.giftsReceived++;
            }
            this.updateInteraction(friendId);
            this.saveFriendData();
        }
    }
    
    /**
     * Increment battle counter
     * @param {string} friendId - Friend ID
     */
    incrementBattle(friendId) {
        const friend = this.getFriend(friendId);
        if (friend) {
            friend.battlesPlayed++;
            this.updateInteraction(friendId);
            this.saveFriendData();
        }
    }
    
    /**
     * Receive friend request (simulated for demo)
     * @param {string} username - Requester username
     * @param {string} petName - Requester's pet name
     * @returns {Object} Result
     */
    receiveFriendRequest(username, petName) {
        // Check if already has request from this user
        if (this.pendingRequests.some(req => req.username === username)) {
            return { success: false, message: 'Request already exists' };
        }
        
        // Check if blocked
        if (this.isBlocked(username)) {
            return { success: false, message: 'User is blocked' };
        }
        
        const request = {
            id: this.generateFriendId(username),
            username,
            petName,
            timestamp: Date.now()
        };
        
        this.pendingRequests.push(request);
        this.saveFriendData();
        
        return { success: true, message: 'Request received' };
    }
    
    /**
     * Clear all friend data
     */
    clearAllData() {
        this.friends = [];
        this.pendingRequests = [];
        this.sentRequests = [];
        this.blockedUsers = [];
        this.saveFriendData();
    }
}

/**
 * Friend Challenge Manager
 * Handles direct challenges between friends
 */
class FriendChallengeManager {
    constructor() {
        this.challenges = [];
        this.loadChallenges();
    }
    
    /**
     * Load challenges from localStorage
     */
    loadChallenges() {
        const saved = localStorage.getItem('friendChallenges');
        if (saved) {
            try {
                this.challenges = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading challenges:', error);
                this.challenges = [];
            }
        }
    }
    
    /**
     * Save challenges to localStorage
     */
    saveChallenges() {
        localStorage.setItem('friendChallenges', JSON.stringify(this.challenges));
    }
    
    /**
     * Send battle challenge to friend
     * @param {string} friendId - Friend ID
     * @param {Object} petData - Challenger's pet data
     * @returns {Object} Result {success, message, challengeId}
     */
    sendChallenge(friendId, petData) {
        const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const challenge = {
            id: challengeId,
            friendId,
            challengerPet: {
                name: petData.name,
                level: petData.level,
                stage: petData.stage,
                health: petData.health
            },
            status: 'pending',
            sentAt: Date.now()
        };
        
        this.challenges.push(challenge);
        this.saveChallenges();
        
        return {
            success: true,
            message: 'Challenge sent!',
            challengeId
        };
    }
    
    /**
     * Accept battle challenge
     * @param {string} challengeId - Challenge ID
     * @returns {Object} Result with battle info
     */
    acceptChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        
        if (!challenge) {
            return { success: false, message: 'Challenge not found' };
        }
        
        if (challenge.status !== 'pending') {
            return { success: false, message: 'Challenge already responded to' };
        }
        
        challenge.status = 'accepted';
        challenge.acceptedAt = Date.now();
        this.saveChallenges();
        
        return {
            success: true,
            message: 'Challenge accepted!',
            challengerPet: challenge.challengerPet
        };
    }
    
    /**
     * Decline battle challenge
     * @param {string} challengeId - Challenge ID
     * @returns {Object} Result
     */
    declineChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        
        if (!challenge) {
            return { success: false, message: 'Challenge not found' };
        }
        
        challenge.status = 'declined';
        challenge.declinedAt = Date.now();
        this.saveChallenges();
        
        return { success: true, message: 'Challenge declined' };
    }
    
    /**
     * Complete challenge with result
     * @param {string} challengeId - Challenge ID
     * @param {string} winner - 'challenger' or 'accepter'
     * @returns {Object} Result
     */
    completeChallenge(challengeId, winner) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        
        if (!challenge) {
            return { success: false, message: 'Challenge not found' };
        }
        
        challenge.status = 'completed';
        challenge.winner = winner;
        challenge.completedAt = Date.now();
        this.saveChallenges();
        
        return { success: true, message: 'Challenge completed!' };
    }
    
    /**
     * Get pending challenges
     * @returns {Array} Pending challenges
     */
    getPendingChallenges() {
        return this.challenges.filter(c => c.status === 'pending');
    }
    
    /**
     * Get challenge history
     * @returns {Array} Completed challenges
     */
    getChallengeHistory() {
        return this.challenges.filter(c => c.status === 'completed');
    }
    
    /**
     * Clear old challenges (older than 7 days)
     */
    clearOldChallenges() {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.challenges = this.challenges.filter(c => c.sentAt > sevenDaysAgo);
        this.saveChallenges();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FriendManager,
        FriendChallengeManager
    };
}
