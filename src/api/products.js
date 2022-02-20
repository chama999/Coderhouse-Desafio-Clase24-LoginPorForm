import express from 'express'
import { webAuth } from './session-mongo.js';

const { Router } = express

const productsRouter = new Router()

export default productsRouter