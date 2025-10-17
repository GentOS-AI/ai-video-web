"""
Credits purchase API routes
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.credits import (
    CreditsPurchaseRequest,
    CreditsPurchaseResponse,
    CreditsPackageInfo,
)

router = APIRouter()

# Credits packages configuration
CREDITS_PACKAGES = {
    "1000_credits": {
        "credits": 1000,
        "price": 99.0,
        "description": "Premium Pack - 1000 Credits ($99 USD)",
    },
}


@router.post("/purchase", response_model=CreditsPurchaseResponse)
def purchase_credits(
    purchase_request: CreditsPurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Purchase credits package

    Demo mode: Directly adds credits to user account
    Production mode: Would integrate with Stripe/PayPal payment gateway

    Args:
        purchase_request: Purchase request data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Purchase response with success status and new balance
    """
    # Validate package
    package_id = purchase_request.package
    if package_id not in CREDITS_PACKAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid package: {package_id}",
        )

    package_info = CREDITS_PACKAGES[package_id]
    credits_to_add = package_info["credits"]

    # Demo mode: Directly add credits
    # In production, this would:
    # 1. Create a payment intent with Stripe/PayPal
    # 2. Wait for payment confirmation
    # 3. Then add credits to user account
    # 4. Create transaction record in database

    print(f"💳 Processing credits purchase for user {current_user.email}")
    print(f"   Package: {package_id}")
    print(f"   Credits: {credits_to_add}")
    print(f"   Price: ${package_info['price']}")
    print(f"   Old Balance: {current_user.credits}")

    # Add credits to user account
    current_user.credits += credits_to_add
    db.commit()
    db.refresh(current_user)

    new_balance = current_user.credits

    print(f"   New Balance: {new_balance}")
    print(f"✅ Credits purchase completed successfully")

    # Generate transaction ID (in production, this would come from payment gateway)
    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

    return CreditsPurchaseResponse(
        success=True,
        new_balance=new_balance,
        transaction_id=transaction_id,
        message=f"Successfully added {credits_to_add} credits to your account!",
    )


@router.get("/packages", response_model=list[CreditsPackageInfo])
def get_credits_packages():
    """
    Get available credits packages

    Returns:
        List of available credits packages
    """
    packages = []
    for package_id, info in CREDITS_PACKAGES.items():
        packages.append(
            CreditsPackageInfo(
                package_id=package_id,
                credits=info["credits"],
                price=info["price"],
                currency="USD",
                description=info["description"],
            )
        )
    return packages
