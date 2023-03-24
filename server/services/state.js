const rooms = new Map();

// const STATE_HASH_TABLE_ROOMS = 'rooms';

/**
 * 
 */
module.exports = () => ({
  async initRooms (arr) {
    arr.forEach((data, index) => {
      let id = `room-${index}`;
      rooms.set(id, { 
        id, 
        ...data, 
        //captionsId: '31e54b01-facc-4f8b-a336-a1fc2b35b723'
      });
    });
  },

  async getRoomById(id) {
    return rooms.get(id);
  },

  async addRoom(id, data) {
    let room = await this.getRoomById(id);
    if (room) return room;
    rooms.set(id, { id, ...data });
    return await this.getRoomById(id);
  },

  async updateRoomById(id, data) {
    let room = await this.getRoomById(id);
    if (!room) return null;
    rooms.set(id, { ...room, ...data });
    return await this.getRoomById(id);
  },

  async getRoomBySessionId(sessionId) {
    for (const [id, room] of rooms.entries()) {
      if (room.sessionId == sessionId) return room; 
    }
    return null;
  },

  async getCaptionsId(id) {
    let room = await this.getRoomById(id);
    return room? room.captionsId ?? null : null;
  },

  async setCaptionsId(id, captionsId) {
    await this.updateRoomById(id, { captionsId });
    return await this.getRoomById(id);
  },

});