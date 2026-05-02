const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/seats.json');

const seatModel = {
  readData() {
    try {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  },

  writeData(data) {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('写入座位数据失败:', error);
    }
  },

  getSeatsBySessionId(sessionId) {
    const seats = this.readData();
    return seats.filter(seat => seat.sessionId === sessionId);
  },

  getSeatById(sessionId, seatId) {
    const seats = this.readData();
    return seats.find(seat => seat.sessionId === sessionId && seat.id === seatId);
  },

  updateSeatStatus(sessionId, seatId, status) {
    const seats = this.readData();
    const index = seats.findIndex(seat => 
      seat.sessionId === sessionId && seat.id === seatId
    );
    
    if (index === -1) return null;
    
    seats[index].status = status;
    seats[index].updatedAt = Date.now();
    this.writeData(seats);
    return seats[index];
  },

  createSeat(seat) {
    const seats = this.readData();
    const newSeat = {
      ...seat,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    seats.push(newSeat);
    this.writeData(seats);
    return newSeat;
  },

  createSeatsForSession(sessionId, sections) {
    const seats = this.readData();
    const newSeats = [];
    
    sections.forEach(section => {
      for (let row = 1; row <= section.rows; row++) {
        for (let seatNum = 1; seatNum <= section.seatsPerRow; seatNum++) {
          const status = section.forbidden ? 'forbidden' : 'available';
          const seat = {
            id: `${sessionId}-${section.id}-${row}-${seatNum}`,
            sessionId,
            sectionId: section.id,
            sectionName: section.name,
            row,
            number: seatNum,
            price: section.price,
            status,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          newSeats.push(seat);
        }
      }
    });
    
    const allSeats = [...seats, ...newSeats];
    this.writeData(allSeats);
    return newSeats;
  }
};

module.exports = seatModel;
