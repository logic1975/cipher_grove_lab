import { Router, Request, Response } from 'express';
import { ConcertService } from '../services/concertService';

const router = Router();

// GET /api/concerts - Get all concerts with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const includeArtist = req.query.includeArtist === 'true';

    // Build filters
    const filters: any = {};
    if (req.query.artistId) {
      filters.artistId = parseInt(req.query.artistId as string);
    }
    if (req.query.dateFrom) {
      filters.dateFrom = new Date(req.query.dateFrom as string);
    }
    if (req.query.dateTo) {
      filters.dateTo = new Date(req.query.dateTo as string);
    }

    const result = await ConcertService.getAllConcerts(page, limit, filters, includeArtist);

    res.json({
      success: true,
      data: result.concerts,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/concerts/upcoming - Get upcoming concerts
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const concerts = await ConcertService.getUpcomingConcerts(limit);

    res.json({
      success: true,
      data: concerts,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/concerts/stats - Get concert statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await ConcertService.getConcertStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/concerts/artist/:artistId - Get concerts by artist
router.get('/artist/:artistId', async (req: Request, res: Response) => {
  try {
    const artistId = parseInt(req.params.artistId);
    if (isNaN(artistId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid artist ID'
        },
        timestamp: new Date().toISOString()
      });
    }

    const concerts = await ConcertService.getConcertsByArtist(artistId);

    res.json({
      success: true,
      data: concerts,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/concerts/:id - Get concert by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid concert ID'
        },
        timestamp: new Date().toISOString()
      });
    }

    const includeArtist = req.query.includeArtist === 'true';
    const concert = await ConcertService.getConcertById(id, includeArtist);

    if (!concert) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Concert not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: concert,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/concerts - Create a new concert
router.post('/', async (req: Request, res: Response) => {
  try {
    const concertData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
      time: req.body.time ? new Date(`1970-01-01T${req.body.time}`) : undefined
    };

    const concert = await ConcertService.createConcert(concertData);

    res.status(201).json({
      success: true,
      data: concert,
      message: 'Concert created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 400 : 
                      error.message.includes('validation') || error.message.includes('"') ? 400 : 
                      500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/concerts/:id - Update a concert
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid concert ID'
        },
        timestamp: new Date().toISOString()
      });
    }

    const updateData = {
      ...req.body,
      ...(req.body.date && { date: new Date(req.body.date) }),
      ...(req.body.time && { time: new Date(`1970-01-01T${req.body.time}`) })
    };

    const concert = await ConcertService.updateConcert(id, updateData);

    res.json({
      success: true,
      data: concert,
      message: 'Concert updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('validation') || error.message.includes('"') ? 400 : 
                      500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'NOT_FOUND' : 
              statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/concerts/:id - Delete a concert
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid concert ID'
        },
        timestamp: new Date().toISOString()
      });
    }

    await ConcertService.deleteConcert(id);

    res.status(204).send();
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

export default router;