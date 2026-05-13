import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ReservationService } from './reservation.service';
import { Reservation } from '../entities/reservation.entity';
import { CreateReservationInput } from '../dto/reservation.input';

@Resolver(() => Reservation)
export class ReservationResolver {
  constructor(private readonly reservationService: ReservationService) {}

  @Query(() => [Reservation], { name: 'reservations' })
  findAll() {
    return this.reservationService.findAll();
  }

  @Query(() => Reservation, { name: 'reservation', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.reservationService.findOne(id);
  }

  @Mutation(() => Reservation)
  createReservation(@Args('input') input: CreateReservationInput) {
    return this.reservationService.create(input);
  }

  @Mutation(() => Reservation, { nullable: true })
  updateReservationStatus(
    @Args('id', { type: () => ID }) id: number,
    @Args('status') status: string,
  ) {
    return this.reservationService.updateStatus(id, status);
  }
}
