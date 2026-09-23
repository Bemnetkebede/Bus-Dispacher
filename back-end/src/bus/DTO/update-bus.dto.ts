import { CreateBusDto} from "./create-bus.dto.js"
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBusDto extends PartialType(CreateBusDto) {}