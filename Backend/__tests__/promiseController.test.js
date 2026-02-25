import { jest } from '@jest/globals';
import { getPromises, createPromise } from '../Controller/promiseController.js';
import PromiseModel from '../Model/Promise.js';
import Politician from '../Model/Politician.js';
import mongoose from 'mongoose';

describe('Promise Controller - Unit Tests', () => {
  
  // Clear our spies after each test so they don't mix together
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- TEST 1: Get All Promises ---
  it('should fetch all promises and return status 200', async () => {
    // Fake Request and Response objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // The fake data we pretend the database returned
    const mockPromises = [
      { title: 'Build new hospital', category: 'Health', status: 'Pending' }
    ];

    // Use spyOn to intercept the database call 
    jest.spyOn(PromiseModel, 'find').mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPromises)
    });

    // Run your actual controller function
    await getPromises(req, res);

    // Assert (Check) that your function did the right thing
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPromises);
  });

  // --- TEST 2: Create a Promise ---
  it('should create a new promise and return status 201', async () => {
    // Fake Request with a body (like an Admin typing in a form)
    const req = {
      body: {
        title: 'Fix Kandy Roads',
        description: 'Repair all main roads in Kandy',
        category: 'Infrastructure',
        politician: {
          name: 'John Doe',
          party: 'Other',
          district: 'Kandy'
        }
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Spy on Politician lookups/creation and Promise save
    jest.spyOn(Politician, 'findOne').mockResolvedValue(null);
    jest.spyOn(Politician, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
    jest.spyOn(PromiseModel.prototype, 'save').mockResolvedValue({ ...req.body, politicianId: new mongoose.Types.ObjectId() });

    // Run your actual controller function
    await createPromise(req, res);

    // Assert (Check)
    expect(res.status).toHaveBeenCalledWith(201);
    // second arg to json is the saved document
    expect(res.json).toHaveBeenCalled();
  });

  it('should return 400 when politician object is missing required fields', async () => {
    const req = { body: { title: 'T', description: 'Too short', politician: { name: 'X' } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createPromise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});